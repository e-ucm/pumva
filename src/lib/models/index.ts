import { Sequelize, DataTypes } from "sequelize";
import { UserFactory } from "@/lib/models/users/user.model";

export default function initModels(sequelize: Sequelize) {
  const User = UserFactory(sequelize, DataTypes);
  
  return {
    User,
  };
}
