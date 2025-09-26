import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { createProject, extractZipToProject } from "../services/project.creation";

const router = Router();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

router.post("/project/create", async (req, res) => {
  try {
    const { name, description, url, isStatic, env } = req.body;

    const project = await createProject({
      name,
      description,
      url,
      isStatic,
      env: env || {}, 
    });

    res.status(201).json(project);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post(
  "/project/:projectId/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        return res.status(400).json({ error: "projectId is required" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
      }

      await extractZipToProject(projectId, req.file.path);

      res.status(200).json({ message: "Fichiers extraits avec succès" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
