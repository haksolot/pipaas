import { Router } from "express";
import {
  startProject,
  restartProject,
  stopProject,
} from "../services/project.controll";

const router = Router();

router.post("/project/:projectId/start", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { scriptName } = req.body;
    const response = await startProject(projectId, scriptName);
    res.status(200).json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/project/:projectId/restart", async (req, res) => {
  try {
    const { projectId } = req.params;
    await restartProject(projectId);
    res.status(200).json({ message: "Projet rechargé avec succès" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/project/:projectId/stop", async (req, res) => {
  try {
    const { projectId } = req.params;
    await stopProject(projectId);
    res.status(200).json({ message: "Projet arreté avec succès" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
