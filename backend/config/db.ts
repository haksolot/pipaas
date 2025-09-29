import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { ENV } from "./env";

const dbDir = path.dirname(ENV.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db: Database.Database = new Database(ENV.DB_PATH);

db.prepare(`
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    repo_path TEXT NOT NULL,
    start_command TEXT NOT NULL,
    env_vars TEXT,
    is_static INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`).run();

export default db;
