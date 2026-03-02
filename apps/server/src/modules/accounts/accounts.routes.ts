import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import { auth } from "../../middleware/auth.js";
import { requireType } from "../../middleware/require-type.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import {
  getAccount,
  initiateTopup,
  confirmTopup,
  requestWithdrawal,
} from "./accounts.service.js";

const router: RouterType = Router();

// GET /accounts/me — Get account info
router.get(
  "/accounts/me",
  auth,
  asyncHandler(async (req, res) => {
    const account = await getAccount(req.account!.id);
    res.json(account);
  }),
);

// POST /accounts/credits — Top up credits
const topupSchema = z.object({
  amount: z.number().int().positive().min(100, "Minimum topup is 100 credits ($1.00)"),
});

router.post(
  "/accounts/credits",
  auth,
  requireType("consumer"),
  validate(topupSchema),
  asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const result = await initiateTopup(req.account!.id, amount);
    res.status(402).json({
      message: "Payment required to complete topup",
      ...result,
    });
  }),
);

// POST /accounts/credits/confirm — Confirm topup
const confirmTopupSchema = z.object({
  tx_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
});

router.post(
  "/accounts/credits/confirm",
  auth,
  requireType("consumer"),
  validate(confirmTopupSchema),
  asyncHandler(async (req, res) => {
    const { tx_hash } = req.body;
    const result = await confirmTopup(req.account!.id, tx_hash);
    res.json(result);
  }),
);

// POST /accounts/withdrawals — Withdraw earnings
const withdrawSchema = z.object({
  amount: z.number().int().positive().min(500, "Minimum withdrawal is 500 credits ($5.00)"),
});

router.post(
  "/accounts/withdrawals",
  auth,
  requireType("operator"),
  validate(withdrawSchema),
  asyncHandler(async (req, res) => {
    const { amount } = req.body;
    const result = await requestWithdrawal(req.account!.id, amount);
    res.json(result);
  }),
);

export { router as accountsRoutes };
