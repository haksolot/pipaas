import simpleGit, { SimpleGit } from "simple-git";
import fs from "fs";
import path from "path";
import { ENV } from "../config/env";

export async function cloneRepo(repoUrl: string, folderName: string): Promise<string> {
    const targetPath = path.join(ENV.PROJECTS_DIR, folderName);

    if (!fs.existsSync(ENV.PROJECTS_DIR)) {
        fs.mkdirSync(ENV.PROJECTS_DIR, { recursive: true });
    }

    const git: SimpleGit = simpleGit();
    await git.clone(repoUrl, targetPath);

    return targetPath;
}
