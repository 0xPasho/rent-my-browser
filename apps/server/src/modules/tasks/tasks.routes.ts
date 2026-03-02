import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import { auth } from "../../middleware/auth.js";
import { requireType } from "../../middleware/require-type.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { createTask, getTask, recordStep, submitResult } from "./tasks.service.js";

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
  max_budget: z
    .number()
    .int()
    .positive()
    .max(10000, "Max budget cannot exceed 10000 credits"),
});

router.post(
  "/tasks",
  auth,
  requireType("consumer"),
  validate(createTaskSchema),
  asyncHandler(async (req, res) => {
    const result = await createTask(req.account!.id, req.body);
    res.status(202).json(result);
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
  screenshot: z.string().optional(), // base64
});

router.post(
  "/tasks/:id/steps",
  auth,
  requireType("operator"),
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
  requireType("operator"),
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

// POST /tasks/:id/confirm — x402 payment confirmation (stub for v1)
router.post(
  "/tasks/:id/confirm",
  asyncHandler(async (_req, res) => {
    res.status(501).json({
      error: "NOT_IMPLEMENTED",
      message: "x402 per-task payment is not yet supported. Use credit-based flow.",
    });
  }),
);

export { router as tasksRoutes };
