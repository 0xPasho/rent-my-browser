import { Router, type Router as RouterType } from "express";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { accountsRoutes } from "./modules/accounts/accounts.routes.js";
import { tasksRoutes } from "./modules/tasks/tasks.routes.js";
import { nodesRoutes } from "./modules/nodes/nodes.routes.js";
import { offersRoutes } from "./modules/offers/offers.routes.js";

const router: RouterType = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use(authRoutes);
router.use(accountsRoutes);
router.use(tasksRoutes);
router.use(nodesRoutes);
router.use(offersRoutes);

export { router };
