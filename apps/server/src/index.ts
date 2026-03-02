import express from "express";
import cors from "cors";
import pino from "pino";
import { env } from "./env.js";
import { router } from "./routes.js";
import { errorHandler } from "./middleware/error-handler.js";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(router);
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
});
