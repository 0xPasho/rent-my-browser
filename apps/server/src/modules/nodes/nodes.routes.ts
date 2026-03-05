import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import { auth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { createNodeOperator } from "./nodes.service.js";
import { processHeartbeat, getNodeOffers } from "./nodes.service.js";

const router: RouterType = Router();

// --- Node registration (free) ---

const createNodeSchema = z.object({
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  node_type: z.enum(["headless", "real"]),
});

router.post(
  "/nodes",
  validate(createNodeSchema),
  asyncHandler(async (req, res) => {
    const { wallet_address, node_type } = req.body;
    const result = await createNodeOperator(wallet_address, node_type);
    res.status(201).json(result);
  }),
);

// POST /nodes/:id/heartbeat — Register/update node capabilities
const heartbeatSchema = z.object({
  type: z.enum(["headless", "real"]),
  browser: z
    .object({
      name: z.string(),
      version: z.string(),
    })
    .optional(),
  geo: z
    .object({
      country: z.string().length(2),
      region: z.string().optional(),
      city: z.string().optional(),
      ip_type: z.enum(["residential", "datacenter"]),
    })
    .optional(),
  capabilities: z
    .object({
      modes: z.array(z.enum(["simple", "adversarial"])),
      max_concurrent: z.number().int().positive().default(1),
    })
    .optional(),
});

router.post(
  "/nodes/:id/heartbeat",
  auth,

  validate(heartbeatSchema),
  asyncHandler(async (req, res) => {
    const result = await processHeartbeat(
      req.params.id as string,
      req.account!.id,
      req.body,
    );
    res.json(result);
  }),
);

// GET /nodes/:id/offers — Poll for pending offers
router.get(
  "/nodes/:id/offers",
  auth,

  asyncHandler(async (req, res) => {
    const result = await getNodeOffers(
      req.params.id as string,
      req.account!.id,
    );
    res.json(result);
  }),
);

export { router as nodesRoutes };
