import express from "express";
import pm2 from "pm2";

const router = express.Router();

router.get("/project/:projectId/logs", (req, res) => {
  const { projectId } = req.params;
  const pm2Name = `${projectId}`;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const tailLogs = () => {
    pm2.connect((err) => {
      if (err) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        return res.end();
      }

      pm2.launchBus((err, bus) => {
        if (err) {
          res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
          return res.end();
        }

        bus.on("log:out", (packet: any) => {
          if (packet.process.name === pm2Name) {
            res.write(`data: ${packet.data}\n\n`);
          }
        });

        bus.on("log:err", (packet: any) => {
          if (packet.process.name === pm2Name) {
            res.write(`data: ERROR: ${packet.data}\n\n`);
          }
        });
      });
    });
  };

  tailLogs();

  req.on("close", () => {
    res.end();
  });
});

export default router;
