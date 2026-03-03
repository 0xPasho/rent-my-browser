import { Router, type Router as RouterType } from "express";
import { accountsRoutes } from "./modules/accounts/accounts.routes.js";
import { tasksRoutes } from "./modules/tasks/tasks.routes.js";
import { nodesRoutes } from "./modules/nodes/nodes.routes.js";
import { offersRoutes } from "./modules/offers/offers.routes.js";
import { mcpRoutes } from "./modules/mcp/mcp.routes.js";

const router: RouterType = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use(accountsRoutes);
router.use(tasksRoutes);
router.use(nodesRoutes);
router.use(offersRoutes);
router.use(mcpRoutes);

export { router };
