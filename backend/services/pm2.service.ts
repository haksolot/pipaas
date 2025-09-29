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

interface Monit {
  cpu: number;
  memory: number;
}

export function getPM2Metrics(id: string): Promise<Monit> {
  return new Promise((resolve, reject) => {
    pm2.describe(`${ENV.PM2_NAMESPACE}-${id}`, (err, processDescription) => {
      if (err) return reject(err);
      if (!processDescription || !processDescription[0]) {
        return reject(new Error("Process not found"));
      }

      const monit = processDescription[0].monit as Monit | undefined;
      if (!monit) {
        return reject(new Error("Metrics not available"));
      }

      resolve({
        cpu: monit.cpu,
        memory: monit.memory,
      });
    });
  });
}

interface PM2LogPacket {
  process: {
    name: string;
    pm_id: number;
  };
  data: Buffer | string;
}

export function streamPM2Logs(id: string, onData: (log: string) => void): void {
  pm2.launchBus((err, bus) => {
    if (err) throw err;

    const appName = `${ENV.PM2_NAMESPACE}-${id}`;

    bus.on("log:out", (packet: PM2LogPacket) => {
      if (packet.process.name === appName) {
        onData(packet.data.toString());
      }
    });

    bus.on("log:err", (packet: PM2LogPacket) => {
      if (packet.process.name === appName) {
        onData(packet.data.toString());
      }
    });
  });
}