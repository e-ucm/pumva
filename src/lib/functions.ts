import { validateParams } from "@/lib/validateParams";
import { Sequelize, QueryTypes } from "sequelize";
import fs from "node:fs";
import { logger } from "./logger";

export default function initFunctions(sequelize: Sequelize) {
  return {
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
