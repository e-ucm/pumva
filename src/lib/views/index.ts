import { Sequelize } from "sequelize";
import { UserViews } from "@/lib/views/userView.queries.js";

export default function initFunctions(sequelize: Sequelize) {
  return {
    User: UserViews(),
  };
}