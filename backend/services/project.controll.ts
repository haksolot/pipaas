import pm2 from "pm2";
import path from "path";
import { db } from "../config/db";
import { Project } from "../models/Project";

export async function startProject(projectId: string, scriptName: string) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("SELECT * FROM projects WHERE folder_name = ?");
    const project = stmt.get(projectId) as Project;
    const projectName = project.name;

    if (!project) return reject(new Error("Project not found"));

    const scripts = JSON.parse(project.scripts);
    if (!scripts[scriptName])
      return reject(new Error(`Script "${scriptName}" non trouvé`));

    const commandParts = scripts[scriptName].split(" ");
    const mainScript = commandParts[1];
    const nodeArgs = commandParts.slice(2);

    const envVars = JSON.parse(project.env || "{}");

    pm2.connect((err) => {
      if (err) return reject(err);

      pm2.start(
        {
          name: `${projectId}`,
          cwd: project.package_json_path,
          script: path.join(project.package_json_path, mainScript),
          args: nodeArgs,
          autorestart: true,
          env: { ...process.env, ...envVars },
          interpreter: "node",
        },
        (err, proc) => {
          pm2.disconnect();
          if (err) return reject(err);
          resolve(proc);
        }
      );
    });
  });
}

export async function restartProject(projectId: string) {
  return new Promise<void>((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);

      pm2.restart(`${projectId}`, (err) => {
        pm2.disconnect();
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

export async function stopProject(projectId: string) {
  return new Promise<void>((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);

      pm2.stop(`${projectId}`, (err) => {
        pm2.disconnect();
        if (err) return reject(err);
        resolve();
      });
    });
  });
}
