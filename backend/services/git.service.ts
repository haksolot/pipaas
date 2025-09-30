import simpleGit, { SimpleGit } from "simple-git";
import fs from "fs";
import path from "path";
import { ENV } from "../config/env";

export async function cloneRepo(
  repoUrl: string,
  folderName: string
): Promise<string> {
  const targetPath = path.join(ENV.PROJECTS_DIR, folderName);

  if (!fs.existsSync(ENV.PROJECTS_DIR)) {
    fs.mkdirSync(ENV.PROJECTS_DIR, { recursive: true });
  }

  const git: SimpleGit = simpleGit();
  await git.clone(repoUrl, targetPath);

  return targetPath;
}

export async function pullRepo(repoPath: string): Promise<void> {
  if (!fs.existsSync(repoPath)) {
    throw new Error(`Repository path does not exist: ${repoPath}`);
  }

  const git: SimpleGit = simpleGit(repoPath);

  try {
    await git.fetch();

    await git.reset(["--hard", "origin/master"]);

    await git.pull("origin", "master");
  } catch (err) {
    throw new Error(`Failed to pull repository: ${(err as Error).message}`);
  }
}