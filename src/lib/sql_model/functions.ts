import { validateParams } from "@/lib/sql_model/validateParams.js";

module.exports = (sequelize: { query: (arg0: any, arg1: { replacements: {}; type: any; }) => any; QueryTypes: { SELECT: any; }; }) => {
  return {
    runViewQuery: async (query: { sql: any; params: any; }, params = {}) => {
      if (!query.sql || !query.params) {
        throw new Error("Invalid query template");
      }

      validateParams(query.params, params);

      return sequelize.query(query.sql, {
        replacements: params,
        type: sequelize.QueryTypes.SELECT,
      });
    },
  };
};
