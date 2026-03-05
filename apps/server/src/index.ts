import express from "express";
import pino from "pino";
import pinoHttpModule from "pino-http";
const pinoHttp = (pinoHttpModule as any).default || pinoHttpModule;
import rateLimit from "express-rate-limit";
import { env } from "./env.js";
import { router } from "./routes.js";
import { startDispatchJobs } from "./modules/dispatch/dispatch.jobs.js";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

const app = express();

// Rate limiting
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "RATE_LIMITED", message: "Too many requests, try again later" },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "RATE_LIMITED", message: "Too many requests, try again later" },
});

// CORS — manual handler for Express 5 compatibility
function isAllowedOrigin(origin: string): boolean {
  return (
    origin === "https://rentmybrowser.dev" ||
    origin.endsWith(".rentmybrowser.dev")
  );
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (env.NODE_ENV === "production") {
    if (origin && isAllowedOrigin(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
  } else if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});
app.use(pinoHttp({ logger, autoLogging: { ignore: (req: any) => req.url === "/health" } }));

// Stripe webhook needs raw body — must be before express.json()
app.use("/webhook/stripe", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "10mb" }));

// Apply rate limits: stricter on public endpoints, looser on authenticated
app.use("/auth", publicLimiter);
app.use("/accounts", authLimiter);
app.use("/nodes", authLimiter);
app.use("/tasks", authLimiter);
app.use("/offers", authLimiter);

app.use(router);

// Express 5 error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if ("statusCode" in err && typeof (err as any).statusCode === "number") {
      const appErr = err as any;
      logger.warn({ err: appErr, statusCode: appErr.statusCode }, appErr.message);
      res.status(appErr.statusCode).json({
        error: appErr.code,
        message: appErr.message,
        ...(appErr.details ? { details: appErr.details } : {}),
      });
      return;
    }
    logger.error(err, "Unhandled error");
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    });
  },
);

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
  startDispatchJobs();
});
