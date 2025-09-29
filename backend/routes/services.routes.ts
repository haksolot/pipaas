import { Router } from "express";
import {
  createProjectController,
  deleteProjectController,
  startProjectController,
  stopProjectController,
  restartProjectController,
} from "../controllers/service.controller";

const router: Router = Router();

router.post("/", createProjectController);
router.delete("/:id", deleteProjectController);

router.post("/:id/start", startProjectController);
router.post("/:id/stop", stopProjectController);
router.post("/:id/restart", restartProjectController);

export default router;
