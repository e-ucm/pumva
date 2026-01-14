import { Sequelize, Model } from "sequelize";

export class Technology extends Model {
  declare technology_id: number;
  declare technology: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function TechnologyFactory(
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) {
  Technology.init({
    technology_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    technology: {
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
    tableName: "Technologies",   // <-- use your existing table name
    timestamps: true,    // disable createdAt/updatedAt if not in table
    freezeTableName: true, // prevent Sequelize from pluralizing table name
  });

  return Technology;
};