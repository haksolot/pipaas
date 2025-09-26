import pm2 from "pm2";
import { db } from "../config/db";
import { Project } from "../models/Project";

export async function getProjectsWithStatus(): Promise<
  (Project & { status: string })[]
> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare("SELECT * FROM projects");
    const projects = stmt.all() as Project[];

    pm2.connect((err) => {
      if (err) return reject(err);

      pm2.list((err, list) => {
        pm2.disconnect();
        if (err) return reject(err);

        const result = projects.map((proj) => {
          const pm2Proc = list.find((p) => p.name === `${proj.folder_name}`);
          return {
            ...proj,
            status: pm2Proc ? pm2Proc.pm2_env?.status || "unknown" : "stopped",
          };
        });

        resolve(result);
      });
    });
  });
}

export async function describeProject(projectId: string) {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);

      pm2.describe(`${projectId}`, (err, processDescription) => {
        pm2.disconnect();
        if (err) return reject(err);
        resolve(processDescription);
      });
    });
  });
}

export function streamMetrics(res: any, projectName: string) {
  pm2.connect((err: any) => {
    if (err) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      return;
    }

    const interval = setInterval(() => {
      pm2.describe(projectName, (err: any, desc: any[]) => {
        if (err || !desc || !desc[0]) return;
        
        const monit = desc[0].monit; // CPU + RAM
        const info = {
          memory: monit.memory,
          cpu: monit.cpu,
          pid: desc[0].pid
        };

        res.write(`data: ${JSON.stringify(info)}\n\n`);
      });
    }, 2000);

    res.on("close", () => {
      clearInterval(interval);
      pm2.disconnect();
    });
  });
}