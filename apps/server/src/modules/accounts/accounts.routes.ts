import { Router, type Router as RouterType } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { paymentMiddleware } from "@x402/express";
import { env, BASE_CHAIN_ID, isSandbox } from "../../env.js";
import { x402Server } from "../../lib/x402.js";
import { stripe } from "../../lib/stripe.js";
import { auth } from "../../middleware/auth.js";
import { requireType } from "../../middleware/require-type.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import {
  createConsumerAccount,
  getAccount,
  addCredits,
  requestWithdrawal,
  createChallenge,
  verifyChallenge,
  sendEmailMagicLink,
  verifyEmailToken,
  getSession,
  updateAccountEmail,
} from "./accounts.service.js";

const router: RouterType = Router();

// --- Registration (free) ---

const walletSchema = z.object({
  wallet_address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
});

router.post(
  "/accounts",
  validate(walletSchema),
  asyncHandler(async (req, res) => {
    const result = await createConsumerAccount(req.body.wallet_address);
    res.status(201).json(result);
  }),
);

// --- Account info ---

router.get(
  "/accounts/me",
  auth,
  asyncHandler(async (req, res) => {
    const account = await getAccount(req.account!.id);
    res.json(account);
  }),
);

// --- Auth challenge/verify ---

router.post(
  "/auth/challenge",
  validate(walletSchema),
  asyncHandler(async (req, res) => {
    const result = await createChallenge(req.body.wallet_address);
    res.json(result);
  }),
);

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
    res.json(result);
  }),
);

// --- Email magic link ---

const emailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "RATE_LIMITED", message: "Too many magic link requests, try again later" },
});

const emailSchema = z.object({
  email: z.string().email(),
});

router.post(
  "/auth/email/send",
  emailLimiter,
  validate(emailSchema),
  asyncHandler(async (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const result = await sendEmailMagicLink(req.body.email, baseUrl);
    res.json(result);
  }),
);

router.get(
  "/auth/email/verify",
  asyncHandler(async (req, res) => {
    const token = req.query.token as string;
    if (!token) {
      res.status(400).json({ error: "MISSING_TOKEN", message: "Token is required" });
      return;
    }
    const result = await verifyEmailToken(token);
    // Redirect to frontend with JWT
    res.redirect(`${env.DASHBOARD_URL ?? "http://localhost:3001"}/auth/callback?token=${result.token}`);
  }),
);

// --- Session (JWT-based, no API key needed) ---

router.get(
  "/auth/session",
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "Missing token" });
      return;
    }
    const token = authHeader.slice(7);
    const account = await getSession(token);
    res.json(account);
  }),
);

// --- Update account email ---

const updateEmailSchema = z.object({
  email: z.string().email(),
});

router.patch(
  "/accounts/me",
  auth,
  validate(updateEmailSchema),
  asyncHandler(async (req, res) => {
    const result = await updateAccountEmail(req.account!.id, req.body.email);
    res.json(result);
  }),
);

// --- Credit topup (x402) ---

const TOPUP_TIERS: Record<string, { credits: number; price: string }> = {
  "100": { credits: 100, price: "$1" },
  "500": { credits: 500, price: "$5" },
  "1000": { credits: 1000, price: "$10" },
  "5000": { credits: 5000, price: "$50" },
  "20000": { credits: 20000, price: "$200" },
};

const x402TopupRoutes: Record<string, any> = {};
for (const [key, tier] of Object.entries(TOPUP_TIERS)) {
  x402TopupRoutes[`POST /accounts/credits/crypto/${key}`] = {
    accepts: [
      {
        scheme: "exact",
        price: tier.price,
        network: BASE_CHAIN_ID,
        payTo: env.PLATFORM_WALLET_ADDRESS,
      },
    ],
    description: `Top up ${tier.credits} credits (${tier.price} USDC)`,
  };
}

router.post(
  "/accounts/credits/crypto/:tier",
  auth,
  requireType("consumer"),
  paymentMiddleware(x402TopupRoutes, x402Server),
  asyncHandler(async (req, res) => {
    const tierKey = req.params.tier as string;
    const tier = TOPUP_TIERS[tierKey];
    if (!tier) {
      res
        .status(400)
        .json({ error: "INVALID_TIER", message: "Invalid topup tier" });
      return;
    }
    const result = await addCredits(req.account!.id, tier.credits);
    res.json(result);
  }),
);

// --- Credit topup (Stripe Checkout) ---

const stripeSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(5, "Minimum top-up is $5")
    .max(500, "Maximum top-up is $500"),
});

router.post(
  "/accounts/credits/stripe",
  auth,
  requireType("consumer"),
  validate(stripeSchema),
  asyncHandler(async (req, res) => {
    if (!stripe) {
      res.status(501).json({
        error: "NOT_CONFIGURED",
        message: "Stripe is not configured on this server.",
      });
      return;
    }

    const amountDollars = req.body.amount;
    const credits = Math.round(amountDollars * 100); // 1 credit = $0.01

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amountDollars * 100), // Stripe uses cents
            product_data: {
              name: `${credits.toLocaleString()} Credits`,
              description: `rentmybrowser.ai — ${credits.toLocaleString()} credits ($${amountDollars.toFixed(2)})`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        account_id: req.account!.id,
        credits: String(credits),
      },
      success_url: `${env.DASHBOARD_URL}/dashboard/top-up?success=true`,
      cancel_url: `${env.DASHBOARD_URL}/dashboard/top-up?cancelled=true`,
    });

    res.json({ url: session.url });
  }),
);

// --- Stripe webhook ---

router.post(
  "/webhook/stripe",
  asyncHandler(async (req, res) => {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      res.status(501).json({ error: "NOT_CONFIGURED" });
      return;
    }

    const sig = req.headers["stripe-signature"] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      res.status(400).json({ error: "INVALID_SIGNATURE" });
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const accountId = session.metadata?.account_id;
      const credits = Number(session.metadata?.credits);

      if (accountId && credits > 0 && session.payment_status === "paid") {
        await addCredits(accountId, credits, session.id);
      }
    }

    res.json({ received: true });
  }),
);

// --- Alternative topup (sandbox/testnet only) ---

if (isSandbox) {
  const alternativeSchema = z.object({
    amount: z.number().int().positive(),
  });

  router.post(
    "/accounts/credits/alternative",
    auth,
    requireType("consumer"),
    validate(alternativeSchema),
    asyncHandler(async (req, res) => {
      const result = await addCredits(req.account!.id, req.body.amount);
      res.json(result);
    }),
  );
}

// --- Withdrawals ---

const withdrawSchema = z.object({
  amount: z
    .number()
    .int()
    .positive()
    .min(500, "Minimum withdrawal is 500 credits ($5.00)"),
});

router.post(
  "/accounts/withdrawals",
  auth,
  requireType("operator"),
  validate(withdrawSchema),
  asyncHandler(async (req, res) => {
    const result = await requestWithdrawal(req.account!.id, req.body.amount);
    res.json(result);
  }),
);

export { router as accountsRoutes };
