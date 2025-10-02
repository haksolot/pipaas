import api from "@/lib/axios";
import type { Service } from "@/components/services-column";

export interface CreateProjectInput {
  name: string;
  repoUrl: string;
  startCommand: string;
  envVars?: Record<string, string>;
  isStatic?: boolean;
}

export async function createProject(data: CreateProjectInput) {
  const response = await api.post("/services", data);
  return response.data;
}

export async function updateService(service: Service): Promise<void> {
  if (!service.id) throw new Error("Service id is missing");

  try {
    await api.put(`/services/${service.id}`, {
      name: service.name,
      start_command: service.start_command,
      env_vars: service.env_vars,
    });
  } catch (err: any) {
    throw new Error(err.response?.data?.error || "Failed to update service");
  }
}

export async function fetchServices(): Promise<Service[]> {
  const res = await api.get("/services");
  const data = res.data as any[];

  return data.map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status,
    lastUpdated: item.created_at,
    env_vars: item.env_vars,
    isStatic: item.is_static,
    start_command: item.start_command,
  }));
}

export async function startService(id: string) {
  await api.post(`/services/${id}/start`);
}

export async function restartService(id: string) {
  await api.post(`/services/${id}/restart`);
}

export async function stopService(id: string) {
  await api.post(`/services/${id}/stop`);
}
