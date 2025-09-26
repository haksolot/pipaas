import { Router } from "express";

import { deleteProject } from "../services/project.delete";
import { updateProject } from "../services/project.edition";

const router = Router();

router.post("/project/:projectId/update", async (req, res) => {
  try {
    const { projectId } = req.params;
    const updatedProject = await updateProject({ projectId, ...req.body });
    res.json(updatedProject);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/project/:projectId/delete", async (req, res) => {
  try {
    const { projectId } = req.params;
    const response = await deleteProject(projectId);
    res.status(200).json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
