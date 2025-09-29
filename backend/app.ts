import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api", routes);

export default app;
