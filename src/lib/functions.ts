import { validateParams } from "@/lib/validateParams";
import { Sequelize, QueryTypes } from "sequelize";
import fs from "node:fs";
import { logger } from "@/lib/logger";

/**
 * Initializes database utility functions.
 * Provides helper functions for running view queries and executing SQL files.
 * 
 * @function initFunctions
 * @param {Sequelize} sequelize - The Sequelize database instance
 * @returns {Object} Object containing database utility functions:
 *   - runViewQuery: Execute a parameterized view query
 *   - runSqlFile: Execute an SQL file with multiple statements
 * 
 * @example
 * ```typescript
 * const functions = initFunctions(sequelize);
 * 
 * // Run a view query
 * const results = await functions.runViewQuery(
 *   { sql: 'SELECT * FROM Users WHERE id = :id', params: { id: {} } },
 *   { id: 123 }
 * );
 * 
 * // Run SQL file
 * await functions.runSqlFile('./init.sql');
 * ```
 */
export default function initFunctions(sequelize: Sequelize) {
  return {
    /**
     * Executes a parameterized SQL query against a database view.
     * 
     * @async
     * @param {Object} query - Query template object
     * @param {string} query.sql - SQL query string with named parameters
     * @param {Object} query.params - Parameter schema for validation
     * @param {Object} [params={}] - Parameter values to substitute
     * @returns {Promise<Array>} Query results
     * @throws {Error} If parameters don't match schema
     */
    runViewQuery: async (query: { sql: any; params: any; }, params = {}) => {
      if (!query.sql || !query.params) {
        throw new Error("Invalid query template");
      }

      validateParams(query.params, params);

      return sequelize.query(query.sql, {
        replacements: params,
        type: QueryTypes.SELECT,
      });
    },
    /**
     * Executes an SQL file containing multiple SQL statements.
     * Splits file by semicolons and executes each statement sequentially.
     * 
     * @async
     * @param {string} filePath - Path to SQL file
     * @returns {Promise<void>}
     * @throws {Error} If file read or query execution fails
     */
    runSqlFile : async(filePath: string) => {
      const sql = fs.readFileSync(filePath, "utf8");
      const statements = sql
        .split(/;\s*$/m)
        .map(s => s.trim())
        .filter(Boolean);

      for (const stmt of statements) {
        logger.debug('EXECUTING:' + stmt);
        await sequelize.query(stmt);
      }
    },
  };
};
