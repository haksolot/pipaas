// src/config/index.ts
import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const config = {
  projectsDir: path.resolve(process.env.PROJECTS_DIR || "./data/projects"),
  dataDir: path.resolve(process.env.DATA_DIR || "./data"),
  sqliteFile: path.resolve(process.env.SQLITE_FILE || "./data/db.sqlite"),
  port: Number(process.env.PORT) || 4000
};
