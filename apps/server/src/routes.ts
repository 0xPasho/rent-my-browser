import { Router, type Router as RouterType } from "express";

const router: RouterType = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Module routes will be mounted here as they're built:
// router.use(authRoutes);
// router.use(accountsRoutes);
// router.use(tasksRoutes);
// router.use(nodesRoutes);
// router.use(offersRoutes);

export { router };
