import { v4 as uuidv4 } from "uuid";
// import db from "../config/db";
import db from "../config/db";
import { cloneRepo } from "./git.service";
import fs from "fs";
import path from "path";
import pm2 from "pm2";
import { stopProject } from "./pm2.service";

export interface CreateProjectInput {
  name: string;
  repoUrl: string;
  startCommand: string;
  envVars?: Record<string, string>;
  isStatic?: boolean;
}

export interface ProjectRow {
  id: string;
  name: string;
  repo_url: string;
  repo_path: string;
  start_command: string;
  env_vars?: string;
  is_static: number;
  created_at: string;
}

export interface Project extends CreateProjectInput {
  id: string;
  repoPath: string;
}

export interface ServiceInfo {
  id: string;
  name: string;
  status: "online" | "stopped" | "errored" | "unknown";
  cpu?: number;
  memory?: number;
  port?: string;
  repoPath?: string;
  isStatic: boolean;
}

export async function createProject(
  input: CreateProjectInput
): Promise<Project> {
  const id = uuidv4();
  const repoPath = await cloneRepo(input.repoUrl, id);

  const stmt = db.prepare(`
        INSERT INTO services (id, name, repo_url, repo_path, start_command, env_vars, is_static)
        VALUES (@id, @name, @repo_url, @repo_path, @start_command, @env_vars, @is_static)
    `);

  stmt.run({
    id,
    name: input.name,
    repo_url: input.repoUrl,
    repo_path: repoPath,
    start_command: input.startCommand,
    env_vars: input.envVars ? JSON.stringify(input.envVars) : null,
    is_static: input.isStatic ? 1 : 0,
  });

  return { id, repoPath, ...input };
}

export async function deleteProject(id: string): Promise<void> {
  const stmt = db.prepare("SELECT * FROM services WHERE id = ?");
  const project = stmt.get(id) as ProjectRow;

  if (!project) {
    throw new Error("Project not found");
  }

  await stopProject(id);

  if (fs.existsSync(project.repo_path)) {
    fs.rmSync(project.repo_path, { recursive: true, force: true });
  }

  db.prepare("DELETE FROM services WHERE id = ?").run(id);
}

export async function listServices(): Promise<ServiceInfo[]> {
  return new Promise((resolve, reject) => {
    pm2.list((err, list) => {
      if (err) return reject(err);

      const dbServices = db.prepare("SELECT * FROM services").all();

      const result: ServiceInfo[] = dbServices.map((svc: any) => {
        const pm2proc = list.find(
          (p) => p.name === `${ENV.PM2_NAMESPACE}-${svc.id}`
        );

        return {
          id: svc.id,
          name: svc.name,
          status:
            (pm2proc?.pm2_env?.status as "online" | "stopped" | "errored") ??
            "unknown",
          cpu: pm2proc?.monit?.cpu,
          memory: pm2proc?.monit?.memory,
          port: svc.envVars?.PORT,
          repoPath: svc.repo_path,
          isStatic: !!svc.isStatic,
        };
      });

      resolve(result);
    });
  });
}
