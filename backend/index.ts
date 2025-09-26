import express from "express";
import dotenv from "dotenv";
import projectsCreationRoutes from "./routes/project.routes.creation";
import projectsControllRoutes from "./routes/project.routes.controll";
import projectsEditionRoutes from "./routes/project.routes.edition";
import projectsInformationsRoutes from "./routes/project.routes.informations";
import projectsLogsRoutes from "./routes/project.routes.logs";
import path from "path";
import { initMountStaticProjects } from "./utils/staticMounting";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use("/", projectsCreationRoutes);
app.use("/", projectsControllRoutes);
app.use("/", projectsEditionRoutes);
app.use("/", projectsInformationsRoutes);
app.use("/", projectsLogsRoutes);

initMountStaticProjects(app);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});