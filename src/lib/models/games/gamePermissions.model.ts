import { Sequelize, Model } from "sequelize";

/**
 * Represents a game permission relationship between users and games.
 * Uses a composite primary key (game_id, user_id) to define unique permissions.
 * 
 * @class GamePermissions
 * @extends {Model}
 * 
 * @property {number} game_id - Foreign key referencing a game (part of composite primary key)
 * @property {number} user_id - Foreign key referencing a user (part of composite primary key)
 * @property {string} permission - Type of permission granted (e.g., 'READ', 'WRITE')
 */
export class GamePermissions extends Model {
  declare game_id: number;
  declare user_id: number;
  declare permission: string;
}

/**
 * Factory function to initialize the GamePermissions model with Sequelize.
 * 
 * Configures the GamePermissions model schema with composite primary key
 * and associates it with the "Games_Permissions" database table.
 * 
 * @function GamePermissionsFactory
 * @param {Sequelize} sequelize - The Sequelize instance to use for database connection
 * @param {typeof import("sequelize").DataTypes} DataTypes - Sequelize DataTypes for field definitions
 * @returns {typeof GamePermissions} The initialized GamePermissions model class
 * 
 * @example
 * ```typescript
 * const GamePermissions = GamePermissionsFactory(sequelize, DataTypes);
 * 
 * // Create a new permission
 * const permission = await GamePermissions.create({
 *   game_id: 1,
 *   user_id: 5,
 *   permission: 'READ'
 * });
 * ```
 */
export function GamePermissionsFactory(
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) {
  GamePermissions.init({
    game_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    permission: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: "Games_Permissions",   // <-- use your existing table name
    timestamps: true,    // disable createdAt/updatedAt if not in table
    freezeTableName: true, // prevent Sequelize from pluralizing table name
  });

  return GamePermissions;
};