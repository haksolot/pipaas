// src/pages/services/index.tsx
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/services-datatable";
import { columns } from "@/components/services-column";
import type { Service } from "@/components/services-column";
import { AddServiceDialog } from "@/components/add-service-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { fetchServices } from "@/services/projectService";

export function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Service[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        const services = await fetchServices();
        setData(services);
      } catch (error) {
        setError(`Error fetching services: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  const handleServiceCreated = (newService: Service) => {
    setData((prev) => [...prev, newService]);
  };

  const handleActionDone = async ({
    serviceName,
    action,
  }: {
    serviceName: string;
    action: "start" | "restart" | "stop";
  }) => {
    setAlertMessage(`Service "${serviceName}" ${action}ed`);
    try {
      const services = await fetchServices();
      setData(services);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Input placeholder="Search a service..." />
        </div>
        <AddServiceDialog onServiceCreated={handleServiceCreated} />
      </div>
      {alertMessage && (
        <Alert>
          <AlertTitle>{alertMessage}</AlertTitle>
        </Alert>
      )}

      {loading && <p>Fetching services...</p>}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {!loading && !error && (
        <DataTable
          columns={columns((id) => {
            setData((prev) => prev.filter((s) => s.id !== id));
          }, handleActionDone)}
          data={data}
        />
      )}
    </div>
  );
}
