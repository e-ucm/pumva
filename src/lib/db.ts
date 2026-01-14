import { Sequelize } from "sequelize";
import { logger } from "@/lib/logger";
import initModels from "@/lib/models";
import initFunctions from "@/lib/functions";
import initViews from "@/lib/views";

type DbType = {
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
  Tables: ReturnType<typeof initModels>;
  Functions: ReturnType<typeof initFunctions>;
  Views: ReturnType<typeof initViews>;
};

const globalForDb = globalThis as unknown as {
  db?: DbType;
};

if (!globalForDb.db) {
  const isTest = process.env.NODE_ENV === "test";
  logger.info(`Initializing DB (isTest: ${isTest})`);
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: isTest ? ":memory:" : "/data/db/pumva_data.db",
    logging: (sql) => logger.debug(sql),
  });

  globalForDb.db = {
    Sequelize,
    sequelize,
    Tables: initModels(sequelize),
    Functions: initFunctions(sequelize),
    Views: initViews(sequelize),
  };
}



export const db = globalForDb.db!;
