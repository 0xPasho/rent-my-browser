import express from "express";
import cors from "cors";
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

// Middleware
app.use(cors());
app.use(pinoHttp({ logger, autoLogging: { ignore: (req: any) => req.url === "/health" } }));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(env.UPLOAD_DIR));

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
