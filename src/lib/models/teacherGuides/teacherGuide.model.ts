import { Sequelize, Model } from "sequelize";

/**
 * Represents a teacher guide for a game in a specific language.
 * Uses a composite primary key (game_id, language_id) to ensure one guide per game-language combination.
 * 
 * @class TeacherGuide
 * @extends {Model}
 * 
 * @property {number} game_id - Foreign key referencing a game (part of composite primary key)
 * @property {number} language_id - Foreign key referencing a language (part of composite primary key)
 * @property {string} url - URL where the teacher guide is hosted
 * @property {Date} createdAt - Timestamp when the guide record was created
 * @property {Date} updatedAt - Timestamp when the guide record was last updated
 */
export class TeacherGuide extends Model {
  declare game_id: number;
  declare language_id: number;
  declare url: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

/**
 * Factory function to initialize the TeacherGuide model with Sequelize.
 * 
 * @function TeacherGuideFactory
 * @param {Sequelize} sequelize - The Sequelize instance to use for database connection
 * @param {typeof import("sequelize").DataTypes} DataTypes - Sequelize DataTypes for field definitions
 * @returns {typeof TeacherGuide} The initialized TeacherGuide model class
 * 
 * @example
 * ```typescript
 * const TeacherGuide = TeacherGuideFactory(sequelize, DataTypes);
 * 
 * // Create a new teacher guide
 * const guide = await TeacherGuide.create({
 *   game_id: 1,
 *   language_id: 1,
 *   url: 'https://example.com/guides/game1-en'
 * });
 * ```
 */
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