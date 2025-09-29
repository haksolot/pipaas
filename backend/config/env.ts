import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const ENV = {
  PORT: parseInt(requireEnv("PORT", "4000"), 10),
  DB_PATH: requireEnv("DB_PATH", "../data/services.db"),
  PROJECTS_DIR: requireEnv("PROJECTS_DIR", "../data/projects"),
  PM2_NAMESPACE: requireEnv("PM2_NAMESPACE", "git-services"),
};
