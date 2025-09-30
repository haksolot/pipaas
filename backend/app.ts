import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index";
import { setupPM2WebSocket } from "./websocket/pm2.ws";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api", routes);

// setupPM2WebSocket(app);

export default app;