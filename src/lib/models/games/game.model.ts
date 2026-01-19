import { Sequelize, Model } from "sequelize";

/**
 * Represents a game entity in the system.
 * 
 * @class Game
 * @extends {Model}
 * 
 * @property {number} game_id - Unique identifier for the game (primary key, auto-increment)
 * @property {boolean} public - Indicates whether the game is publicly accessible
 * @property {number} actual - Current status or version indicator for the game
 * @property {string} name - Display name of the game
 * @property {string} description - Detailed description of the game
 * @property {number} owner_id - Foreign key referencing the user who owns the game
 * @property {string} type - Type or category of the game (e.g., 'WEB', 'DESKTOP')
 * @property {number} technology_id - Foreign key referencing the technology used by the game
 * @property {number} tracker_id - Foreign key referencing the tracker associated with the game
 * @property {Date} createdAt - Timestamp when the game was created
 * @property {Date} updatedAt - Timestamp when the game was last updated
 */
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

/**
 * Factory function to initialize the Game model with Sequelize.
 * 
 * Configures the Game model schema with all fields, data types, and constraints,
 * and associates it with the "Games" database table.
 * 
 * @function GameFactory
 * @param {Sequelize} sequelize - The Sequelize instance to use for database connection
 * @param {typeof import("sequelize").DataTypes} DataTypes - Sequelize DataTypes for field definitions
 * @returns {typeof Game} The initialized Game model class
 * 
 * @example
 * ```typescript
 * const sequelize = new Sequelize('database', 'username', 'password');
 * const Game = GameFactory(sequelize, DataTypes);
 * 
 * // Create a new game
 * const newGame = await Game.create({
 *   name: 'My Game',
 *   description: 'An awesome game',
 *   public: true,
 *   owner_id: 1,
 *   type: 'adventure',
 *   technology_id: 1,
 *   tracker_id: 1
 * });
 * ```
 */
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