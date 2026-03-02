import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import { auth } from "../../middleware/auth.js";
import { requireType } from "../../middleware/require-type.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { claimOffer } from "./offers.service.js";

const router: RouterType = Router();

// POST /offers/:id/claim — Claim an offer (first wins)
const claimSchema = z.object({
  node_id: z.string().uuid(),
});

router.post(
  "/offers/:id/claim",
  auth,
  requireType("operator"),
  validate(claimSchema),
  asyncHandler(async (req, res) => {
    const result = await claimOffer(
      req.params.id as string,
      req.body.node_id,
      req.account!.id,
    );
    res.json(result);
  }),
);

export { router as offersRoutes };
