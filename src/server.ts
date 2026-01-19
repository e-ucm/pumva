import { app } from "./app.js";
import { db } from "@/lib/db";
import { config } from "@/lib/config";

const PORT = config.api.port;

/**
 * Starts the Express server after authenticating the database connection.
 *
 * @async
 * @function start
 * @returns {Promise<void>}
 * @throws {Error} If database authentication fails
 *
 * @example
 * ```typescript
 * // Automatically called when this module is executed
 * start().catch(err => {
 *   console.error("Failed to start server", err);
 *   process.exit(1);
 * });
 * ```
 */
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
