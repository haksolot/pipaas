import { Router } from "express";
import { healthCheck } from "../controllers/health.controller";
import servicesRoutes from "./services.routes";

const router = Router();

router.get("/health", healthCheck);
router.use("/services", servicesRoutes);

export default router;
