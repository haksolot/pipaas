import path from "path";
import express from "express";
import { db } from "../config/db";
import { Project } from "../models/Project";

export function initMountStaticProjects(app: express.Express) {
  const stmt = db.prepare(
    "SELECT folder_name, path, url FROM projects WHERE is_static = 1"
  );
  const staticProjects = stmt.all();

  staticProjects.forEach((project: any) => {
    const staticPath = path.resolve(project.path);
    const mountUrl = `/${project.url}`;

    console.log(`Serving static project at ${mountUrl} -> ${staticPath}`);
    app.use(mountUrl, express.static(staticPath));
  });
}

export function mountStaticProject(project: Project, app: express.Express) {
  if (!project.is_static) return;
  app.use(project.url, express.static(project.path));
}
