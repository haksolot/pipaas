import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditServiceDialog } from "@/components/edit-service-dialog";
import { DeleteServiceDialog } from "@/components/delete-service-dialog";
// import type { ServiceData } from "@/components/edit-service-dialog";
import { Pencil, Trash2, Play, RotateCcw, Square, Eye } from "lucide-react";

import {
  startService,
  stopService,
  restartService,
} from "@/services/projectService";

export type Service = {
  id: string;
  name: string;
  status: "online" | "stopped" | "errored" | "unknown";
  lastUpdated: string;
  env_vars: Record<string, string>;
  isStatic: boolean;
  start_command: string;
};

const getStatusBadge = (status: Service["status"]) => {
  const variant =
    status === "online"
      ? "default"
      : status === "stopped"
      ? "destructive"
      : status === "errored"
      ? "secondary"
      : status === "unknown"
      ? "outline"
      : "outline";
  const label =
    status === "online"
      ? "Active"
      : status === "stopped"
      ? "Inactive"
      : status === "errored"
      ? "Error"
      : status === "unknown"
      ? "Unknown"
      : "Unknown";
  return <Badge variant={variant}>{label}</Badge>;
};

export const columns = (
  onDelete: (id: string) => void,
  onActionDone?: (params: {
    serviceName: string;
    action: "start" | "restart" | "stop";
  }) => void
): ColumnDef<Service>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {getStatusBadge(row.getValue("status"))}
      </div>
    ),
  },
  {
    id: "quickActions",
    header: () => <div className="text-center">Quick actions</div>,
    cell: ({ row }) => {
      const service = row.original;
      const [loading, setLoading] = useState(false);

      const handleAction = async (action: "start" | "restart" | "stop") => {
        setLoading(true);
        try {
          if (action === "start") await startService(service.id);
          if (action === "restart") await restartService(service.id);
          if (action === "stop") await stopService(service.id);
          onActionDone?.({ serviceName: service.name, action });
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="flex gap-2 justify-center items-center">
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer text-green-500 hover:text-green-700"
            onClick={() => handleAction("start")}
          >
            <Play className="h-4 w-4 " />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer text-blue-400 hover:text-blue-600"
            onClick={() => handleAction("restart")}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer text-red-500 hover:text-red-700"
            onClick={() => handleAction("stop")}
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "lastUpdated",
    header: () => <div className="text-center">Last updated</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("lastUpdated")}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const service: Service = {
        id: row.original.id,
        name: row.original.name,
        start_command: row.original.start_command,
        env_vars: row.original.env_vars,
        status: row.original.status,
        lastUpdated: row.original.lastUpdated,
        isStatic: row.original.isStatic,
      };
      return (
        <div className="flex gap-2 justify-center">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Eye className="h-4 w-4" />
          </Button>
          <EditServiceDialog service={service}>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Pencil className="h-4 w-4 " />
            </Button>
          </EditServiceDialog>
          <DeleteServiceDialog
            serviceId={row.original.id}
            serviceName={row.original.name}
            onDeleted={onDelete}
          />
        </div>
      );
    },
  },
];
