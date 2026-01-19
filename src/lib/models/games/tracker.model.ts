import { Sequelize, Model } from "sequelize";

/**
 * Represents a game tracker/analytics system.
 * Tracks the association between technologies and their respective tracking systems.
 * 
 * @class Tracker
 * @extends {Model}
 * 
 * @property {number} technology_id - Foreign key referencing the technology this tracker belongs to
 * @property {number} tracker_id - Unique identifier for the tracker (primary key, auto-increment)
 * @property {string} tracker - Name of the tracker system (e.g., 'Xasu', 'JSTracker')
 * @property {boolean} public - Indicates whether the tracker is publicly accessible
 * @property {number} owner_id - Foreign key referencing the user who owns the tracker
 * @property {Date} createdAt - Timestamp when the tracker record was created
 * @property {Date} updatedAt - Timestamp when the tracker record was last updated
 */
export class Tracker extends Model {
  declare technology_id: number;
  declare tracker_id: number;
  declare tracker: string;
  declare public: boolean;
  declare owner_id: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

/**
 * Factory function to initialize the Tracker model with Sequelize.
 * 
 * @function TrackerFactory
 * @param {Sequelize} sequelize - The Sequelize instance to use for database connection
 * @param {typeof import("sequelize").DataTypes} DataTypes - Sequelize DataTypes for field definitions
 * @returns {typeof Tracker} The initialized Tracker model class
 * 
 * @example
 * ```typescript
 * const Tracker = TrackerFactory(sequelize, DataTypes);
 * 
 * // Create a new tracker
 * const tracker = await Tracker.create({
 *   technology_id: 1,
 *   tracker: 'Xasu',
 *   public: true,
 *   owner_id: 1
 * });
 * ```
 */
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