import { v4 as uuidv4 } from "uuid";
// import db from "../config/db";
import db from "../config/db";
import { cloneRepo } from "./git.service";
import fs from "fs";
import path from "path";
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
