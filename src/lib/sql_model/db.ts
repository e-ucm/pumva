import { Sequelize } from "sequelize";
import { logger } from "@/lib/logger.js";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "/data/db/pumva_data.db", // file-based DB
  logging: logger.info,            // SQL logs (optional)
});

const db : any = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models (tables)
db.Tables = require("@/lib/sql_model/models/index")(sequelize, Sequelize);

// Utilities
db.Functions = require("@/lib/sql_model/functions")(sequelize);

// Views (query templates only)
db.Views = require("@/lib/sql_model/views/index");

module.exports = db;