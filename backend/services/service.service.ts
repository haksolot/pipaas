import { v4 as uuidv4 } from "uuid";
// import db from "../config/db";
import db from "../config/db";
import { cloneRepo, pullRepo } from "./git.service";
import fs from "fs";
import path from "path";
import pm2 from "pm2";
import { ENV } from "../config/env";
import {
  startProject,
  restartProject,
  stopProject,
  deleteProjectPM2,
} from "./pm2.service";

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
  id: number;
  name: string;
  status: "online" | "stopped" | "errored" | "unknown";
  cpu: number;
  memory: number;
  // port: number;
  env_vars: string;
  repoPath: string;
  isStatic: boolean;
}

export interface UpdateServiceData {
  name?: string;
  start_command?: string;
  env_vars?: Record<string, string>;
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

  await startProject(
    id,
    repoPath,
    input.startCommand,
    input.envVars || {},
    input.isStatic
  );

  return { id, repoPath, ...input };
}

export async function deleteProject(id: string): Promise<void> {
  const stmt = db.prepare("SELECT * FROM services WHERE id = ?");
  const project = stmt.get(id) as ProjectRow;

  if (!project) {
    throw new Error("Project not found");
  }

  await stopProject(id);
  await deleteProjectPM2(id);

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
          cpu: pm2proc?.monit?.cpu ?? 0,
          memory: pm2proc?.monit?.memory ?? 0,
          env_vars: svc.env_vars ?? "",
          repoPath: svc.repo_path,
          isStatic: !!svc.is_static,
          start_command: svc.start_command,
          created_at: svc.created_at
        };
      });

      resolve(result);
    });
  });
}

export function editService(id: string, data: UpdateServiceData): void {
  const service = db.prepare("SELECT * FROM services WHERE id = ?").get(id);
  if (!service) throw new Error("Service not found");

  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }

  if (data.start_command !== undefined) {
    updates.push("start_command = ?");
    values.push(data.start_command);
  }

  if (data.env_vars !== undefined) {
    updates.push("env_vars = ?");
    values.push(JSON.stringify(data.env_vars));
  }

  if (updates.length === 0) {
    return;
  }

  values.push(id);

  const sql = `UPDATE services SET ${updates.join(", ")} WHERE id = ?`;
  db.prepare(sql).run(...values);
}

interface Service {
  id: string;
  repoPath: string;
  startCommand: string;
  envVars: Record<string, string>;
  isStatic: boolean;
}

interface ServiceRow {
  id: string;
  repo_path: string;
  start_command: string;
  env_vars: string | null;
  is_static: number;
}

export async function updateService(id: string): Promise<void> {
  const row = db.prepare("SELECT * FROM services WHERE id = ?").get(id) as ServiceRow;
  if (!row) throw new Error("Service not found");

  const service: Service = {
    id: row.id,
    repoPath: row.repo_path,
    startCommand: row.start_command,
    envVars: row.env_vars ? JSON.parse(row.env_vars) : {},
    isStatic: Boolean(row.is_static),
  };

  await stopProject(id);

  await pullRepo(service.repoPath);

  await startProject(
    service.id,
    service.repoPath,
    service.startCommand || "",
    service.envVars,
    service.isStatic
  );
}
