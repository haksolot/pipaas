import Database from "better-sqlite3";
import { config } from "./index";
import fs from "fs";
import path from "path";

const dbDir = path.dirname(config.sqliteFile);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db: Database.Database = new Database(config.sqliteFile);

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    description TEXT,
    folder_name TEXT UNIQUE,
    path TEXT,
    url TEXT,
    is_static INTEGER,
    package_json_path TEXT,
    default_script TEXT,
    scripts TEXT,
    env TEXT, 
    created_at TEXT
  )
`);



export { db };
