import { Sequelize, Model } from "sequelize";

/**
 * Represents a game version record in the database.
 * Tracks different versions of a game with their external URLs and timestamps.
 * 
 * @class GamesVersions
 * @extends {Model}
 * 
 * @property {number} game_id - Foreign key referencing the associated game
 * @property {number} version_id - Unique identifier for the version (primary key, auto-increment)
 * @property {string} version - Version string/number (e.g., '1.0.0', 'v2.1')
 * @property {string} external_url - The external URL where this version is hosted
 * @property {Date} createdAt - Timestamp when the version record was created
 * @property {Date} updatedAt - Timestamp when the version record was last updated
 */
export class GamesVersions extends Model {
  /** The ID of the associated game */
  declare game_id: number;
  
  /** The unique identifier for the version (primary key) */
  declare version_id: number;
  
  /** The version string/number */
  declare version: string;
  
  /** The external URL associated with the game version */
  declare external_url: string;
  
  /** The timestamp when the record was created */
  declare createdAt: Date;
  
  /** The timestamp when the record was last updated */
  declare updatedAt: Date;
}

/**
 * Factory function to initialize the GamesVersions model with Sequelize.
 * 
 * @function GamesVersionsFactory
 * @param {Sequelize} sequelize - The Sequelize instance to use for database connection
 * @param {typeof import("sequelize").DataTypes} DataTypes - Sequelize DataTypes for field definitions
 * @returns {typeof GamesVersions} The initialized GamesVersions model class
 * 
 * @example
 * ```typescript
 * const GamesVersions = GamesVersionsFactory(sequelize, DataTypes);
 * 
 * // Create a new game version
 * const version = await GamesVersions.create({
 *   game_id: 1,
 *   version: '1.2.0',
 *   external_url: 'https://example.com/game/v1.2.0'
 * });
 * ```
 */
export function GamesVersionsFactory(
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) {
  GamesVersions.init({
    game_id: {
      type: DataTypes.INTEGER,
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