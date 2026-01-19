import { Sequelize, Model } from "sequelize";

/**
 * Represents a language in which teacher guides can be available.
 * 
 * @class Language
 * @extends {Model}
 * 
 * @property {number} language_id - Unique identifier for the language (primary key, auto-increment)
 * @property {string} language - Language name (e.g., 'English', 'Spanish', 'French')
 * @property {Date} createdAt - Timestamp when the language record was created
 * @property {Date} updatedAt - Timestamp when the language record was last updated
 */
export class Language extends Model {
  declare language_id: number;
  declare language: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

/**
 * Factory function to initialize the Language model with Sequelize.
 * 
 * @function LanguageFactory
 * @param {Sequelize} sequelize - The Sequelize instance to use for database connection
 * @param {typeof import("sequelize").DataTypes} DataTypes - Sequelize DataTypes for field definitions
 * @returns {typeof Language} The initialized Language model class
 * 
 * @example
 * ```typescript
 * const Language = LanguageFactory(sequelize, DataTypes);
 * 
 * // Create a new language
 * const lang = await Language.create({
 *   language: 'English'
 * });
 * ```
 */
export function LanguageFactory(
  sequelize: Sequelize,
  DataTypes: typeof import("sequelize").DataTypes
) {
  Language.init({
    language_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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