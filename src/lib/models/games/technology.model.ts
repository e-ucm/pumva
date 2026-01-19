import { Sequelize, Model } from "sequelize";

/**
 * Represents a game technology/engine in the system.
 * Stores information about different technologies that can be used to develop games.
 * 
 * @class Technology
 * @extends {Model}
 * 
 * @property {number} technology_id - Unique identifier for the technology (primary key, auto-increment)
 * @property {string} technology - Name of the technology (e.g., 'Unity', 'Unreal Engine', 'Godot')
 * @property {Date} createdAt - Timestamp when the technology record was created
 * @property {Date} updatedAt - Timestamp when the technology record was last updated
 */
export class Technology extends Model {
  declare technology_id: number;
  declare technology: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

/**
 * Factory function to initialize the Technology model with Sequelize.
 * 
 * @function TechnologyFactory
 * @param {Sequelize} sequelize - The Sequelize instance to use for database connection
 * @param {typeof import("sequelize").DataTypes} DataTypes - Sequelize DataTypes for field definitions
 * @returns {typeof Technology} The initialized Technology model class
 * 
 * @example
 * ```typescript
 * const Technology = TechnologyFactory(sequelize, DataTypes);
 * 
 * // Create a new technology
 * const tech = await Technology.create({
 *   technology: 'Unity'
 * });
 * ```
 */
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