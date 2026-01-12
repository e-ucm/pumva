import { Sequelize } from "sequelize";
import { logger } from "@/lib/logger";
import initModels from "@/lib/models";
import initFunctions from "@/lib/functions";
import Views from "@/lib/views";

type DbType = {
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
  Tables: ReturnType<typeof initModels>;
  Functions: ReturnType<typeof initFunctions>;
  Views: typeof Views;
};

const globalForDb = globalThis as unknown as {
  db?: DbType;
};

if (!globalForDb.db) {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "/data/db/pumva_data.db",
    logging: (msg) => logger.info(msg),
  });

  globalForDb.db = {
    Sequelize,
    sequelize,
    Tables: initModels(sequelize),
    Functions: initFunctions(sequelize),
    Views,
  };
}

export const db = globalForDb.db!;
