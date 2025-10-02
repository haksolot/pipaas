import { useState } from "react";
import { createProject } from "@/services/projectService";
import type { CreateProjectInput } from "@/services/projectService";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Service } from "@/components/services-column";

export interface EnvVarForm {
  key: string;
  value: string;
}

interface AddServiceDialogProps {
  onServiceCreated?: (service: Service) => void;
}

export function AddServiceDialog({ onServiceCreated }: AddServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [startCommand, setStartCommand] = useState("");
  const [isStatic, setIsStatic] = useState(false);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [envVars, setEnvVars] = useState<EnvVarForm[]>([
    { key: "", value: "" },
  ]);

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const removeEnvVar = (index: number) => {
    if (envVars.length <= 1) return;
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setProgress(20);

    const envObject = envVars
      .filter((env) => env.key.trim() !== "")
      .reduce((acc, env) => {
        acc[env.key] = env.value;
        return acc;
      }, {} as Record<string, string>);

    const serviceData: CreateProjectInput = {
      name,
      repoUrl,
      startCommand,
      envVars: envObject,
      isStatic,
    };

    try {
      setProgress(50);
      const project = await createProject(serviceData);
      setProgress(100);

      setName("");
      setRepoUrl("");
      setStartCommand("");
      setEnvVars([{ key: "", value: "" }]);
      setIsStatic(false);
      setOpen(false);
      setProgress(0);
      setLoading(false);
      onServiceCreated?.(project);
    } catch (err) {
      setError("Failed creating the project");
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus /> Add a service
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a new service</DialogTitle>
          <DialogDescription>
            Fill in the details below to register a new service.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="mb-4">
            <Progress value={progress} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Service"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repoUrl">Repository URL</Label>
            <Input
              id="repoUrl"
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/your/repo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startCommand">Start Command</Label>
            <Input
              id="startCommand"
              value={startCommand}
              onChange={(e) => setStartCommand(e.target.value)}
              placeholder="npm start"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Environment Variables</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEnvVar}
                className="cursor-pointer"
              >
                <Plus />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {envVars.map((env, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="KEY"
                    value={env.key}
                    onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="VALUE"
                    value={env.value}
                    onChange={(e) =>
                      updateEnvVar(index, "value", e.target.value)
                    }
                    className="flex-1"
                  />
                  {envVars.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEnvVar(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="isStatic"
              checked={isStatic}
              onCheckedChange={(checked) => setIsStatic(checked as boolean)}
              className="cursor-pointer"
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="isStatic">Is Static</Label>
              <p className="text-sm text-muted-foreground">
                Check if this service serves static files only (no backend).
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer">
              Add Service
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
