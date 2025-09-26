import { Router } from "express";
import {
  getProjectsWithStatus,
  describeProject,
  streamMetrics,
} from "../services/project.informations";

const router = Router();

router.get("/projects", async (req, res) => {
  try {
    const response = await getProjectsWithStatus();
    res.status(200).json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/project/:projectId/describe", async (req, res) => {
  try {
    const { projectId } = req.params;
    const description = await describeProject(projectId);
    res.json(description);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/project/:projectName/metrics", (req, res) => {
  const { projectName } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const keepAlive = setInterval(() => {
    res.write(":\n\n");
  }, 15000);

  streamMetrics(res, projectName);

  req.on("close", () => {
    clearInterval(keepAlive);
    res.end();
  });
});

export default router;
