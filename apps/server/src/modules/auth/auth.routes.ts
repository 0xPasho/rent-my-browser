import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import {
  initiateAccountCreation,
  confirmAccountCreation,
  createChallenge,
  verifyChallenge,
} from "./auth.service.js";

const router: RouterType = Router();

// POST /accounts — Create consumer account
const createAccountSchema = z.object({
  wallet_address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
});

router.post(
  "/accounts",
  validate(createAccountSchema),
  asyncHandler(async (req, res) => {
    const { wallet_address } = req.body;
    const result = await initiateAccountCreation(wallet_address, "consumer");
    res.status(402).json({
      message: "Payment required to complete registration",
      ...result.paymentDetails,
    });
  }),
);

// POST /accounts/confirm — Confirm consumer registration
const confirmAccountSchema = z.object({
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tx_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
});

router.post(
  "/accounts/confirm",
  validate(confirmAccountSchema),
  asyncHandler(async (req, res) => {
    const { wallet_address, tx_hash } = req.body;
    const result = await confirmAccountCreation(
      wallet_address,
      tx_hash,
      "consumer",
    );
    res.status(200).json(result);
  }),
);

// POST /nodes — Create operator account
const createNodeSchema = z.object({
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  node_type: z.enum(["headless", "real"]),
});

router.post(
  "/nodes",
  validate(createNodeSchema),
  asyncHandler(async (req, res) => {
    const { wallet_address, node_type } = req.body;
    const result = await initiateAccountCreation(
      wallet_address,
      "operator",
      node_type,
    );
    res.status(402).json({
      message: "Payment required to complete registration",
      ...result.paymentDetails,
    });
  }),
);

// POST /nodes/confirm — Confirm operator registration
const confirmNodeSchema = z.object({
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tx_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  node_type: z.enum(["headless", "real"]),
});

router.post(
  "/nodes/confirm",
  validate(confirmNodeSchema),
  asyncHandler(async (req, res) => {
    const { wallet_address, tx_hash, node_type } = req.body;
    const result = await confirmAccountCreation(
      wallet_address,
      tx_hash,
      "operator",
      node_type,
    );
    res.status(200).json(result);
  }),
);

// POST /auth/challenge — Request a challenge message
const challengeSchema = z.object({
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

router.post(
  "/auth/challenge",
  validate(challengeSchema),
  asyncHandler(async (req, res) => {
    const { wallet_address } = req.body;
    const result = await createChallenge(wallet_address);
    res.status(200).json(result);
  }),
);

// POST /auth/verify — Verify signature, return API key + dashboard URL
const verifySchema = z.object({
  wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
});

router.post(
  "/auth/verify",
  validate(verifySchema),
  asyncHandler(async (req, res) => {
    const { wallet_address, signature } = req.body;
    const result = await verifyChallenge(wallet_address, signature);
    res.status(200).json(result);
  }),
);

export { router as authRoutes };
