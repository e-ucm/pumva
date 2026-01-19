import { Sequelize } from "sequelize";
import { logger } from "@/lib/logger";
import initModels from "@/lib/models";
import initFunctions from "@/lib/functions";
import initViews from "@/lib/views";
import { config } from '@/lib/config';

/**
 * Database connection and initialization type definition.
 * 
 * @typedef {Object} DbType
 * @property {typeof Sequelize} Sequelize - Sequelize constructor
 * @property {Sequelize} sequelize - Sequelize instance
 * @property {ReturnType<typeof initModels>} Tables - All database models
 * @property {ReturnType<typeof initFunctions>} Functions - Database utility functions
 * @property {ReturnType<typeof initViews>} Views - Database view queries
 */
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

/**
 * Initializes the database connection and models on first import.
 * Uses SQLite with in-memory database for testing, file-based for production.
 * Implements singleton pattern to ensure only one database instance exists.
 * 
 * @example
 * ```typescript
 * import { db } from '@/lib/db';
 * 
 * const users = await db.Tables.User.findAll();
 * const result = await db.Functions.runViewQuery(query, params);
 * ```
 */
if (!globalForDb.db) {
  const isTest = process.env.NODE_ENV === "test";
  logger.info(`Initializing DB (isTest: ${isTest})`);
  logger.info(config.db.complete_path);
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: isTest ? ":memory:" : config.db.complete_path,
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

/**
 * Singleton database instance containing connection, models, functions, and views.
 * 
 * @type {DbType}
 * @global
 */
export const db = globalForDb.db!;
