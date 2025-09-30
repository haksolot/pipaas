import { Request, Response } from "express";
import db from "../config/db.ts";
import {
  createProject,
  CreateProjectInput,
  Project,
  deleteProject,
  ProjectRow,
  listServices,
  UpdateServiceData,
  editService,
  updateService,
} from "../services/service.service";
import {
  startProject,
  stopProject,
  restartProject,
  getPM2Metrics,
  streamPM2Logs,
} from "../services/pm2.service";

export async function createProjectController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name, repoUrl, startCommand, envVars, isStatic } =
      req.body as CreateProjectInput;

    const project: Project = await createProject({
      name,
      repoUrl,
      startCommand,
      envVars,
      isStatic,
    } as CreateProjectInput);

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
}

export async function editServiceController(req: Request, res: Response) {
  const { id } = req.params;
  const data: UpdateServiceData = req.body;
  if (!id) return res.status(400).json({ error: "Missing service id" });
  try {
    editService(id, data);
    res.status(200).json({ message: "Service updated successfully" });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function updateServiceController(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Missing service id" });
  try {
    await updateService(id);
    res.status(200).json({ message: "Service updated successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function deleteProjectController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await deleteProject(id!);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete project" });
  }
}

export async function startProjectController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const project = db
      .prepare("SELECT * FROM services WHERE id = ?")
      .get(id) as ProjectRow;
    if (!project) return res.status(404).json({ error: "Project not found" });

    await startProject(
      project.id,
      project.repo_path,
      project.start_command,
      JSON.parse(project.env_vars || "{}"),
      project.is_static === 1
    );

    res.status(200).json({ message: "Project started" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start project" });
  }
}

export async function stopProjectController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await stopProject(id!);
    res.status(200).json({ message: "Project stopped" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to stop project" });
  }
}

export async function restartProjectController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await restartProject(id!);
    res.status(200).json({ message: "Project restarted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to restart project" });
  }
}

export async function metricsController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const metrics = await getPM2Metrics(id!);
    res.status(200).json(metrics);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export function getServiceLogs(req: Request, res: Response) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Missing service id" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`event: ping\ndata: connected to logs of ${id}\n\n`);

  streamPM2Logs(id, (log) => {
    res.write(
      `event: log\ndata: ${JSON.stringify({ serviceId: id, log })}\n\n`
    );
  });

  req.on("close", () => {
    res.end();
  });
}

export async function getAllServices(req: Request, res: Response) {
  try {
    const services = await listServices();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
