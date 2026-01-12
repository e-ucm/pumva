import { validateParams } from "@/lib/validateParams.js";
import { Sequelize, QueryTypes } from "sequelize";

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
  };
};
