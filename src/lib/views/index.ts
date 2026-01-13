import { Sequelize } from "sequelize";
import { GamesViews } from "@/lib/views/gamesView.queries";
import { UsersViews } from "@/lib/views/usersView.queries";
export default function initViews(sequelize: Sequelize) {
  return {
    Games: GamesViews(),
    Users: UsersViews(),
  };
}