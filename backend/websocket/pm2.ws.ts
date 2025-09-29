import { WebSocketServer } from "ws";
import { streamPM2Logs, getPM2Metrics } from "../services/pm2.service";

export function setupPM2WebSocket(server: any) {
  const wss = new WebSocketServer({ server, path: "/ws/pm2" });

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const id = url.searchParams.get("id");

    if (!id) {
      ws.send(JSON.stringify({ error: "Missing service id" }));
      ws.close();
      return;
    }

    streamPM2Logs(id, (log) => {
      ws.send(
        JSON.stringify({
          type: "log",
          serviceId: id,
          timestamp: new Date().toISOString(),
          data: log,
        })
      );
    });

    const interval = setInterval(async () => {
      try {
        const metrics = await getPM2Metrics(id);
        ws.send(
          JSON.stringify({
            type: "metrics",
            serviceId: id,
            timestamp: new Date().toISOString(),
            data: metrics,
          })
        );
      } catch (err) {
        ws.send(
          JSON.stringify({
            type: "error",
            serviceId: id,
            message: (err as Error).message,
          })
        );
      }
    }, 2000);

    ws.on("close", () => clearInterval(interval));
  });
}
