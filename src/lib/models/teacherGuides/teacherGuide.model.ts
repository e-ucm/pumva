import { Sequelize, Model } from "sequelize";

export class TeacherGuide extends Model {
  declare game_id: number;
  declare language_id: number;
  declare url: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function TeacherGuideFactory(
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) {
  TeacherGuide.init({
    game_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    language_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
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
    tableName: "Teacher_Guides",   // <-- use your existing table name
    timestamps: true,    // disable createdAt/updatedAt if not in table
    freezeTableName: true, // prevent Sequelize from pluralizing table name
  });

  return TeacherGuide;
};