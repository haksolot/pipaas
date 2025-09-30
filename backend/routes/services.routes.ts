import { Router } from "express";
import {
  createProjectController,
  deleteProjectController,
  startProjectController,
  stopProjectController,
  restartProjectController,
  metricsController,
  getServiceLogs,
  getAllServices,
  editServiceController,
  updateServiceController,
} from "../controllers/service.controller";

const router: Router = Router();

router.post("/", createProjectController);
router.put("/:id", editServiceController);
router.delete("/:id", deleteProjectController);

router.put("/:id/update", updateServiceController);
router.post("/:id/start", startProjectController);
router.post("/:id/stop", stopProjectController);
router.post("/:id/restart", restartProjectController);

router.get("/", getAllServices);
router.get("/:id/metrics", getServiceLogs);
router.get("/:id/logs", getServiceLogs);

export default router;
