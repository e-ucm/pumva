import { Sequelize, Model } from "sequelize";

export class Game extends Model {
  declare game_id: number;
  declare public: boolean;
  declare actual: number;
  declare name: string;
  declare description: string;
  declare owner_id: number;
  declare type: string;
  declare technology_id: number;
  declare tracker_id: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function GameFactory(
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) {
  Game.init({
    game_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    actual: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    technology_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tracker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt:{
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt:{
      type: DataTypes.DATE,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: "Games",   // <-- use your existing table name
    timestamps: true,    // disable createdAt/updatedAt if not in table
    freezeTableName: true, // prevent Sequelize from pluralizing table name
  });

  return Game;
};