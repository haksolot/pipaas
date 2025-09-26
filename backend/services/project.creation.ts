import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { config } from "../config";
import { db } from "../config/db";
import { v4 as uuidv4 } from "uuid";

export async function createProject({
  name,
  description,
  url,
  isStatic,
  env = {},
}: {
  name: string;
  description: string;
  url: string;
  isStatic: boolean;
  env?: Record<string, string>;
}) {
  const projectId = uuidv4();
  const projectPath = path.join(config.projectsDir, projectId);

  fs.mkdirSync(projectPath, { recursive: true });

  const stmt = db.prepare(`
    INSERT INTO projects (name, description, folder_name, path, url, is_static, env, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  stmt.run(
    name,
    description,
    projectId,
    projectPath,
    url,
    isStatic ? 1 : 0,
    JSON.stringify(env)
  );

  return {
    name,
    folderName: projectId,
    path: projectPath,
    url,
    isStatic,
    env,
  };
}

export async function extractZipToProject(
  projectId: string,
  zipFilePath: string
): Promise<void> {
  const projectPath = path.join(config.projectsDir, projectId);

  if (!fs.existsSync(projectPath)) {
    throw new Error(`Le projet ${projectId} n'existe pas`);
  }

  const archiveRoot = path.join(config.dataDir, "archive");
  if (!fs.existsSync(archiveRoot)) {
    fs.mkdirSync(archiveRoot, { recursive: true });
  }

  const projectArchivePath = path.join(archiveRoot, projectId + "-" + Date.now());
  fs.mkdirSync(projectArchivePath);

  fs.readdirSync(projectPath).forEach(file => {
    const curPath = path.join(projectPath, file);
    try {
      fs.renameSync(curPath, path.join(projectArchivePath, file));
    } catch (err) {
      console.warn(`Impossible de déplacer ${curPath}: ${err}`);
    }
  });

  await fs
    .createReadStream(zipFilePath)
    .pipe(unzipper.Extract({ path: projectPath }))
    .promise();

  fs.unlinkSync(zipFilePath);

  analyzeProject(projectId, projectPath);
}


export function analyzeProject(projectId: string, projectPath: string) {
  function findPackageJson(dir: string): string | null {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory() && file.name === "node_modules") {
        continue;
      }
      if (file.isFile() && file.name === "package.json") {
        return path.join(dir, file.name);
      }
      if (file.isDirectory()) {
        const found = findPackageJson(path.join(dir, file.name));
        if (found) return found;
      }
    }
    return null;
  }

  const packagePath = findPackageJson(projectPath);
  if (!packagePath) {
    throw new Error("Aucun package.json trouvé dans le projet");
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

  if (!pkg.scripts || typeof pkg.scripts !== "object") {
    throw new Error("Pas de scripts valides dans le package.json");
  }

  const packageDir = path.dirname(packagePath);

  const stmt = db.prepare(`
    UPDATE projects
    SET package_json_path = ?, scripts = ?
    WHERE folder_name = ?
  `);
  stmt.run(packageDir, JSON.stringify(pkg.scripts), projectId);

  return {
    packagePath,
    scripts: pkg.scripts,
  };
}
