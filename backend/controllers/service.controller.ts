import { Request, Response } from "express";
import db from "../config/db";
import { createProject, CreateProjectInput, Project, deleteProject, ProjectRow } from "../services/service.service";
import { startProject, stopProject, restartProject } from "../services/pm2.service";

export async function createProjectController(req: Request, res: Response): Promise<void> {
    try {
        const { name, repoUrl, startCommand, envVars, isStatic } = req.body as CreateProjectInput;

        const project: Project = await createProject({ name, repoUrl, startCommand, envVars, isStatic } as CreateProjectInput);

        res.status(201).json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create project" });
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
        const project = db.prepare("SELECT * FROM services WHERE id = ?").get(id) as ProjectRow;
        if (!project) return res.status(404).json({ error: "Project not found" });

        await startProject(project.id, project.repo_path, project.start_command, JSON.parse(project.env_vars || "{}"), project.is_static === 1);

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