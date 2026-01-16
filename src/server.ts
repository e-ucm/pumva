import { app } from "./app.js";
import { db } from "@/lib/db";
import { config } from "@/lib/config";

const PORT = config.api.port;
async function start() {
  await db.sequelize.authenticate();

  app.listen(PORT, () => {
    console.log(`🚀 API running on ${config.api.url}`);
  });
}

start().catch(err => {
  console.error("Failed to start server", err);
  process.exit(1);
});
