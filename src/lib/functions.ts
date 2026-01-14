import { validateParams } from "@/lib/validateParams";
import { Sequelize, QueryTypes } from "sequelize";
import fs from "node:fs";

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

      // Split only if needed (SQLite is fine with multiple statements)
      await sequelize.query(sql);
    }
  };
};
