import { Sequelize, Model } from "sequelize";

/**
 * Represents a user in the system.
 * 
 * @class User
 * @extends {Model}
 * 
 * @property {number} user_id - Unique identifier for the user (primary key, auto-increment)
 * @property {string} username - Unique username for authentication
 * @property {string} email - User's email address
 * @property {string} role - User's role in the system (e.g., 'admin', 'teacher', 'student')
 * @property {Date} createdAt - Timestamp when the user was created
 * @property {Date} updatedAt - Timestamp when the user was last updated
 */
export class User extends Model {
  declare user_id: number;
  declare username: string;
  declare email: string;
  declare role: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

/**
 * Factory function to initialize the User model with Sequelize.
 * 
 * Configures the User model schema with all fields, data types, and constraints,
 * and associates it with the "Users" database table.
 * 
 * @function UserFactory
 * @param {Sequelize} sequelize - The Sequelize instance to use for database connection
 * @param {typeof import("sequelize").DataTypes} DataTypes - Sequelize DataTypes for field definitions
 * @returns {typeof User} The initialized User model class
 * 
 * @example
 * ```typescript
 * const User = UserFactory(sequelize, DataTypes);
 * 
 * // Create a new user
 * const user = await User.create({
 *   username: 'john_doe',
 *   email: 'john@example.com',
 *   role: 'student'
 * });
 * ```
 */
export function UserFactory(
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) {
  User.init({
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
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
    tableName: "Users",   // <-- use your existing table name
    timestamps: true,    // disable createdAt/updatedAt if not in table
    freezeTableName: true, // prevent Sequelize from pluralizing table name
  });

  return User;
};