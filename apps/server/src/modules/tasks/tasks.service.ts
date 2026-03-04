import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { tasks } from "../../db/schema/tasks.js";
import { steps } from "../../db/schema/steps.js";
import { nodes } from "../../db/schema/nodes.js";
import { accounts } from "../../db/schema/accounts.js";
import {
  ValidationError,
  NotFoundError,
  AuthError,
} from "../../lib/errors.js";
import { estimateTask } from "../ai/ai.service.js";
import { holdBudget, releaseBudget, chargeTask } from "../ledger/ledger.service.js";
import { broadcastOffers } from "../dispatch/dispatch.service.js";
import { uploadScreenshot } from "../storage/storage.service.js";
import { calculateEstimatedCost, calculateActualCost, getPricePerStep } from "./tasks.lib.js";
import { sanitizeValue } from "../../lib/sanitize.js";
import { updateNodeScore } from "../nodes/nodes.service.js";

const DEFAULT_TIMEOUT_MS = 300_000;
const DEFAULT_ALLOW_DOWNGRADE = true;

interface CreateTaskInput {
  goal: string;
  context?: {
    data?: Record<string, unknown>;
    tier?: "headless" | "real" | "auto";
    mode?: "simple" | "adversarial";
    geo?: string;
  };
  settings?: {
    timeout_ms?: number;
    allow_downgrade?: boolean;
  };
  max_budget: number;
}

export async function createTask(accountId: string, input: CreateTaskInput) {
  // Check balance
  const [account] = await db
    .select({ balance: accounts.balance })
    .from(accounts)
    .where(eq(accounts.id, accountId));

  if (!account) {
    throw new NotFoundError("Account not found");
  }

  if (account.balance < input.max_budget) {
    throw new ValidationError(
      `Insufficient balance: have ${account.balance}, need ${input.max_budget}`,
    );
  }

  // Sanitize user-provided data
  const sanitizedData = input.context?.data
    ? (sanitizeValue(input.context.data) as Record<string, unknown>)
    : undefined;

  // AI estimation with routing metadata
  const estimate = await estimateTask(
    input.goal,
    sanitizedData,
    input.context?.tier,
    input.context?.mode,
  );

  if (!estimate.safe) {
    throw new ValidationError(
      `Task rejected: ${estimate.reason || "deemed unsafe"}`,
    );
  }

  const tier = estimate.tier;
  const mode = estimate.mode;

  // Validate mode + tier compatibility
  if (mode === "adversarial" && tier === "headless") {
    throw new ValidationError(
      "Adversarial mode requires a real browser node, not headless",
    );
  }

  const estimatedCost = calculateEstimatedCost(
    tier,
    mode,
    estimate.estimatedSteps,
  );

  // Use AI-extracted geo, fall back to consumer-provided geo
  const geo = estimate.routing.geo || input.context?.geo;

  // Store routing metadata in context
  const contextWithRouting = {
    ...input.context,
    routing: estimate.routing,
  };

  // Resolve settings with defaults
  const resolvedSettings = {
    timeout_ms: input.settings?.timeout_ms ?? DEFAULT_TIMEOUT_MS,
    allow_downgrade: input.settings?.allow_downgrade ?? DEFAULT_ALLOW_DOWNGRADE,
  };

  // Hold max budget and create task
  const [task] = await db
    .insert(tasks)
    .values({
      accountId,
      goal: input.goal,
      context: contextWithRouting,
      settings: resolvedSettings,
      status: "queued",
      tier,
      mode,
      complexity: estimate.complexity,
      geo,
      maxBudget: input.max_budget,
      estimatedSteps: estimate.estimatedSteps,
      estimatedCost,
    })
    .returning();

  await holdBudget(accountId, input.max_budget, task.id);

  // Dispatch: broadcast offers to eligible nodes
  await broadcastOffers(task.id);

  return {
    task_id: task.id,
    status: task.status,
    estimate: {
      tier,
      mode,
      complexity: estimate.complexity,
      estimated_steps: estimate.estimatedSteps,
      estimated_cost: estimatedCost,
    },
    routing: estimate.routing,
    max_budget: input.max_budget,
    settings: resolvedSettings,
  };
}

export async function listTasks(
  accountId: string,
  accountType: "consumer" | "operator",
  opts: { status?: string; limit?: number; offset?: number } = {},
) {
  const limit = Math.min(opts.limit ?? 50, 100);
  const offset = opts.offset ?? 0;

  let condition;
  if (accountType === "consumer") {
    condition = eq(tasks.accountId, accountId);
  } else {
    // Operator: find tasks assigned to their node(s)
    const operatorNodes = await db
      .select({ id: nodes.id })
      .from(nodes)
      .where(eq(nodes.accountId, accountId));
    const nodeIds = operatorNodes.map((n) => n.id);
    if (nodeIds.length === 0) {
      return { tasks: [], total: 0 };
    }
    condition = inArray(tasks.nodeId, nodeIds);
  }

  const statusFilter = opts.status
    ? and(condition, eq(tasks.status, opts.status as any))
    : condition;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasks)
    .where(statusFilter!);

  const rows = await db
    .select({
      id: tasks.id,
      goal: tasks.goal,
      status: tasks.status,
      tier: tasks.tier,
      mode: tasks.mode,
      stepsCompleted: tasks.stepsCompleted,
      estimatedSteps: tasks.estimatedSteps,
      estimatedCost: tasks.estimatedCost,
      actualCost: tasks.actualCost,
      maxBudget: tasks.maxBudget,
      createdAt: tasks.createdAt,
      completedAt: tasks.completedAt,
    })
    .from(tasks)
    .where(statusFilter!)
    .orderBy(desc(tasks.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    tasks: rows.map((t) => ({
      task_id: t.id,
      goal: t.goal,
      status: t.status,
      tier: t.tier,
      mode: t.mode,
      steps_completed: t.stepsCompleted,
      estimated_steps: t.estimatedSteps,
      estimated_cost: t.estimatedCost,
      actual_cost: t.actualCost,
      max_budget: t.maxBudget,
      created_at: t.createdAt,
      completed_at: t.completedAt,
    })),
    total: count,
  };
}

export async function getTask(taskId: string, accountId: string) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId));

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  // Consumer can see their own tasks, operator can see tasks claimed by their node
  if (task.accountId !== accountId) {
    const [account] = await db
      .select({ type: accounts.type })
      .from(accounts)
      .where(eq(accounts.id, accountId));

    if (!account || account.type !== "operator" || !task.nodeId) {
      throw new AuthError("Not authorized to view this task");
    }
  }

  // Get steps for this task
  const taskSteps = await db
    .select({
      step_number: steps.stepNumber,
      action: steps.action,
      screenshot_url: steps.screenshotUrl,
      created_at: steps.createdAt,
    })
    .from(steps)
    .where(eq(steps.taskId, taskId))
    .orderBy(steps.stepNumber);

  return {
    task_id: task.id,
    status: task.status,
    tier: task.tier,
    mode: task.mode,
    complexity: task.complexity,
    steps_completed: task.stepsCompleted,
    estimated_steps: task.estimatedSteps,
    estimated_cost: task.estimatedCost,
    actual_cost: task.actualCost,
    max_budget: task.maxBudget,
    result: task.result,
    duration_ms: task.durationMs,
    steps: taskSteps,
    created_at: task.createdAt,
    started_at: task.startedAt,
    completed_at: task.completedAt,
  };
}

function verifyNodeOwnsTask(
  task: { nodeId: string | null; status: string | null },
  nodeId: string,
): void {
  if (task.nodeId !== nodeId) {
    throw new AuthError("This task is not assigned to your node");
  }
  if (!["claimed", "running"].includes(task.status as string)) {
    throw new ValidationError(
      `Task is in '${task.status}' state, cannot report steps`,
    );
  }
}

export async function recordStep(
  taskId: string,
  accountId: string,
  input: { step: number; action: string; screenshot?: string },
) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId));

  if (!task) throw new NotFoundError("Task not found");

  // Find the node for this operator
  const [node] = await db
    .select({ id: nodes.id })
    .from(nodes)
    .where(eq(nodes.accountId, accountId))
    .limit(1);

  if (!node) throw new AuthError("No node found for this account");
  verifyNodeOwnsTask(task, node.id);

  // Validate sequential step number
  const expectedStep = task.stepsCompleted + 1;
  if (input.step !== expectedStep) {
    throw new ValidationError(
      `Expected step ${expectedStep}, got ${input.step}`,
    );
  }

  // Check budget cap
  const pricePerStep = getPricePerStep(
    task.tier as "headless" | "real",
    task.mode as "simple" | "adversarial",
  );
  const costAfterThisStep = pricePerStep * input.step;
  if (costAfterThisStep > task.maxBudget) {
    throw new ValidationError(
      `Budget cap reached: step ${input.step} would cost ${costAfterThisStep} credits, max is ${task.maxBudget}`,
    );
  }

  // Upload screenshot if provided
  let screenshotUrl: string | undefined;
  if (input.screenshot) {
    screenshotUrl = await uploadScreenshot(taskId, input.step, input.screenshot);
  }

  // Insert step
  await db.insert(steps).values({
    taskId,
    stepNumber: input.step,
    action: input.action,
    screenshotUrl,
  });

  // Update task step count and status
  await db
    .update(tasks)
    .set({
      stepsCompleted: input.step,
      status: "running",
    })
    .where(eq(tasks.id, taskId));

  return {
    step: input.step,
    action: input.action,
    screenshot_url: screenshotUrl,
    budget_remaining: task.maxBudget - costAfterThisStep,
  };
}

interface SubmitResultInput {
  status: "completed" | "failed";
  extracted_data?: Record<string, unknown>;
  final_url?: string;
  files?: { name: string; url: string }[];
}

export async function submitResult(
  taskId: string,
  accountId: string,
  input: SubmitResultInput,
) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId));

  if (!task) throw new NotFoundError("Task not found");

  // Find the node for this operator
  const [node] = await db
    .select({ id: nodes.id, accountId: nodes.accountId })
    .from(nodes)
    .where(eq(nodes.accountId, accountId))
    .limit(1);

  if (!node) throw new AuthError("No node found for this account");
  verifyNodeOwnsTask(task, node.id);

  const now = new Date();
  const durationMs = task.startedAt
    ? now.getTime() - task.startedAt.getTime()
    : 0;

  // Calculate actual cost
  const actualCost = calculateActualCost(
    task.tier as "headless" | "real",
    task.mode as "simple" | "adversarial",
    task.stepsCompleted,
    task.maxBudget,
  );

  // Get step screenshots for the result
  const taskSteps = await db
    .select({ screenshot_url: steps.screenshotUrl })
    .from(steps)
    .where(eq(steps.taskId, taskId))
    .orderBy(steps.stepNumber);

  const screenshots = taskSteps
    .map((s) => s.screenshot_url)
    .filter(Boolean) as string[];

  const result = {
    screenshots,
    extracted_data: input.extracted_data || {},
    final_url: input.final_url,
    files: input.files || [],
  };

  // Update task
  await db
    .update(tasks)
    .set({
      status: input.status,
      actualCost,
      result,
      durationMs,
      completedAt: now,
    })
    .where(eq(tasks.id, taskId));

  // Settle payment if completed
  if (input.status === "completed" && actualCost > 0) {
    const unusedBudget = task.maxBudget - actualCost;
    if (unusedBudget > 0) {
      await releaseBudget(task.accountId, unusedBudget, taskId);
    }
    await chargeTask(task.accountId, node.accountId, actualCost, taskId);
  } else {
    await releaseBudget(task.accountId, task.maxBudget, taskId);
  }

  // Update node score
  await updateNodeScore(task.nodeId!, {
    status: input.status,
    stepsCompleted: task.stepsCompleted,
    estimatedSteps: task.estimatedSteps,
  });

  return {
    task_id: taskId,
    status: input.status,
    steps_executed: task.stepsCompleted,
    actual_cost: actualCost,
    max_budget: task.maxBudget,
    result,
    duration_ms: durationMs,
  };
}
