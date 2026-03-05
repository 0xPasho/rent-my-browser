import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import { auth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { createTask, listTasks, getTask, recordStep, submitResult } from "./tasks.service.js";

const router: RouterType = Router();

// POST /tasks — Submit a task
const createTaskSchema = z.object({
  goal: z.string().min(10, "Goal must be at least 10 characters").max(2000),
  context: z
    .object({
      data: z.record(z.unknown()).optional(),
      tier: z.enum(["headless", "real", "auto"]).default("auto"),
      mode: z.enum(["simple", "adversarial"]).default("simple"),
      geo: z.string().optional(),
    })
    .optional(),
  settings: z
    .object({
      timeout_ms: z.number().int().min(30_000, "Timeout must be at least 30 seconds").max(600_000, "Timeout cannot exceed 10 minutes").default(300_000),
      allow_downgrade: z.boolean().default(true),
    })
    .optional(),
  max_budget: z
    .number()
    .int()
    .positive()
    .max(10000, "Max budget cannot exceed 10000 credits"),
});

router.post(
  "/tasks",
  auth,
  validate(createTaskSchema),
  asyncHandler(async (req, res) => {
    const result = await createTask(req.account!.id, req.body);
    res.status(202).json(result);
  }),
);

// GET /tasks — List tasks for the authenticated account
router.get(
  "/tasks",
  auth,
  asyncHandler(async (req, res) => {
    const result = await listTasks(
      req.account!.id,
      {
        status: req.query.status as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
      },
    );
    res.json(result);
  }),
);

// GET /tasks/:id — Get task status and result
router.get(
  "/tasks/:id",
  auth,
  asyncHandler(async (req, res) => {
    const result = await getTask(req.params.id as string, req.account!.id);
    res.json(result);
  }),
);

// POST /tasks/:id/steps — Report a completed step (operator)
const stepSchema = z.object({
  step: z.number().int().positive(),
  action: z.string().min(1).max(500),
  screenshot: z.string().max(7_000_000, "Screenshot must be under 5MB").optional(), // base64 ~5MB
});

router.post(
  "/tasks/:id/steps",
  auth,
  validate(stepSchema),
  asyncHandler(async (req, res) => {
    const result = await recordStep(
      req.params.id as string,
      req.account!.id,
      req.body,
    );
    res.json(result);
  }),
);

// POST /tasks/:id/result — Submit final result (operator)
const resultSchema = z.object({
  status: z.enum(["completed", "failed"]),
  extracted_data: z.record(z.unknown()).optional(),
  final_url: z.string().optional(),
  files: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
      }),
    )
    .optional(),
});

router.post(
  "/tasks/:id/result",
  auth,
  validate(resultSchema),
  asyncHandler(async (req, res) => {
    const result = await submitResult(
      req.params.id as string,
      req.account!.id,
      req.body,
    );
    res.json(result);
  }),
);


export { router as tasksRoutes };
