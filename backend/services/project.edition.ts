import { db } from "../config/db";
import { Project } from "../models/Project";

interface UpdateProjectInput {
  projectId: string; 
  name?: string;
  description?: string;
  url?: string;
  isStatic?: boolean;
  defaultScript?: string;
  env?: Record<string, string>;
}

export async function updateProject({
  projectId,
  name,
  description,
  url,
  isStatic,
  defaultScript,
  env,
}: UpdateProjectInput): Promise<Project> {
  const stmtSelect = db.prepare("SELECT * FROM projects WHERE folder_name = ?");
  const project = stmtSelect.get(projectId) as Project;
  if (!project) throw new Error("Project not found");

  const updatedName = name ?? project.name;
  const updatedDescription = description ?? project.description;
  const updatedUrl = url ?? project.url;
  const updatedIsStatic =
    isStatic !== undefined ? (isStatic ? 1 : 0) : project.is_static;
  const updatedDefaultScript = defaultScript ?? project.default_script;
  const updatedEnv = env ? JSON.stringify(env) : project.env;

  const stmtUpdate = db.prepare(`
    UPDATE projects
    SET name = ?, description = ?, url = ?, is_static = ?, default_script = ?, env = ?
    WHERE folder_name = ?
  `);

  stmtUpdate.run(
    updatedName,
    updatedDescription,
    updatedUrl,
    updatedIsStatic,
    updatedDefaultScript,
    updatedEnv,
    projectId
  );

  return {
    ...project,
    name: updatedName,
    description: updatedDescription,
    url: updatedUrl,
    is_static: updatedIsStatic,
    default_script: updatedDefaultScript,
    env: updatedEnv,
  };
}
