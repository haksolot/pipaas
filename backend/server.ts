import app from "./app";
import { connectPM2, disconnectPM2 } from "./services/pm2.service";
import { ENV } from "./config/env";

connectPM2().then(() => {
  console.log("PM2 connected");
}).catch(console.error);

process.on("exit", () => {
  disconnectPM2();
});


app.listen(ENV.PORT, () => {
  console.log(`Backend running on http://localhost:${ENV.PORT}`);
});
