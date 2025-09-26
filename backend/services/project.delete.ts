import fs from "fs";
// import path from "path";
import pm2 from "pm2";
import { db } from "../config/db";
import { Project } from "../models/Project";

export async function deleteProject(projectId: string) {
  return new Promise<void>((resolve, reject) => {
    const stmt = db.prepare("SELECT * FROM projects WHERE folder_name = ?");
    const project = stmt.get(projectId) as Project | undefined;

    if (!project) return reject(new Error("Project not found"));

    const deleteFolder = (folderPath: string) => {
      if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
      }
    };

    pm2.connect((err) => {
      if (err) return reject(err);

      pm2.delete(`${projectId}`, (err) => {
        pm2.disconnect();

        try {
          deleteFolder(project.path);

          const delStmt = db.prepare("DELETE FROM projects WHERE folder_name = ?");
          delStmt.run(projectId);

          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  });
}
