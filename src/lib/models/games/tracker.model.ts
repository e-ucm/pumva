import { Sequelize, Model } from "sequelize";

export class Tracker extends Model {
  declare technology_id: number;
  declare tracker_id: number;
  declare tracker: string;
  declare public: boolean;
  declare owner_id: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function TrackerFactory(
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) {
  Tracker.init({
    tracker_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    technology_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tracker: {
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
    tableName: "Trackers",   // <-- use your existing table name
    timestamps: true,    // disable createdAt/updatedAt if not in table
    freezeTableName: true, // prevent Sequelize from pluralizing table name
  });

  return Tracker;
};