import { Sequelize, Model } from "sequelize";

export class GamesVersions extends Model {
  declare game_id: number;
  declare version_id: number;
  declare version: string;
  declare external_url: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function GamesVersionsFactory(
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) {
  GamesVersions.init({
    game_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    version_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    external_url: {
      type: DataTypes.STRING,
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
    tableName: "Games_Versions",   // <-- use your existing table name
    timestamps: true,    // disable createdAt/updatedAt if not in table
    freezeTableName: true, // prevent Sequelize from pluralizing table name
  });

  return GamesVersions;
};