import pm2 from "pm2";
import { ENV } from "../config/env";
import path from "path";

export function connectPM2(): Promise<void> {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function disconnectPM2(): void {
  pm2.disconnect();
}

export async function startProject(
  id: string,
  repoPath: string,
  startCommand: string,
  envVars?: Record<string, string>,
  isStatic = false
): Promise<void> {
  const script = startCommand.split(" ")[0];
  if (!script) throw new Error("Invalid start command");

  return new Promise((resolve, reject) => {
    pm2.start(
      {
        name: `${ENV.PM2_NAMESPACE}-${id}`,
        cwd: repoPath,
        script,
        args: startCommand.split(" ").slice(1),
        env: envVars || {},
        exec_mode: "fork",
        autorestart: true,
      },
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

export async function stopProject(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    pm2.stop(`${ENV.PM2_NAMESPACE}-${id}`, (err) => {
      if (err && !err.message.includes("process or namespace not found"))
        return reject(err);
      resolve();
    });
  });
}

export async function restartProject(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    pm2.restart(`${ENV.PM2_NAMESPACE}-${id}`, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export async function deleteProjectPM2(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    pm2.delete(`${ENV.PM2_NAMESPACE}-${id}`, (err) => {
      if (err && !err.message.includes("process or namespace not found"))
        return reject(err);
      resolve();
    });
  });
}
