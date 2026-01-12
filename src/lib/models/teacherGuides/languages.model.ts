import { Sequelize, Model } from "sequelize";

export class Language extends Model {
  declare language_id: number;
  declare language: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function LanguageFactory(
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) {
  Language.init({
    language_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
    tableName: "Languages",   // <-- use your existing table name
    timestamps: true,    // disable createdAt/updatedAt if not in table
    freezeTableName: true, // prevent Sequelize from pluralizing table name
  });

  return Language;
};