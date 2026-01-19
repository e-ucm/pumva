import { Sequelize, DataTypes } from "sequelize";

import { UserFactory } from "@/lib/models/users/user.model";
import { GameFactory } from "@/lib/models/games/game.model";

import { GamePermissionsFactory } from "@/lib/models/games/gamePermissions.model";
import { GamesVersionsFactory } from "@/lib/models/games/gameVersions.model";
import { TechnologyFactory } from "@/lib/models/games/technology.model";
import { TrackerFactory } from "@/lib/models/games/tracker.model";

import { TeacherGuideFactory } from "@/lib/models/teacherGuides/teacherGuide.model";
import { LanguageFactory } from "@/lib/models/teacherGuides/languages.model";

/**
 * Initializes all Sequelize models for the application.
 *
 * This function creates and configures all database models (User, Game, Technology, etc.)
 * and returns them as a single object for use throughout the application.
 *
 * @function initModels
 * @param {Sequelize} sequelize - The Sequelize database instance
 * @returns {Object} An object containing all initialized models:
 *   - User: User model
 *   - Game: Game model
 *   - Technology: Technology model
 *   - Tracker: Tracker model
 *   - TeacherGuide: TeacherGuide model
 *   - Language: Language model
 *   - GamePermissions: GamePermissions model
 *   - GamesVersions: GamesVersions model
 *
 * @example
 * ```typescript
 * const sequelize = new Sequelize('database', 'username', 'password');
 * const models = initModels(sequelize);
 *
 * // Use models
 * const users = await models.User.findAll();
 * const games = await models.Game.findAll();
 * ```
 */
export default function initModels(sequelize: Sequelize) {
  const User = UserFactory(sequelize, DataTypes);
  const Game = GameFactory(sequelize, DataTypes);
  const Technology = TechnologyFactory(sequelize, DataTypes);
  const Tracker = TrackerFactory(sequelize, DataTypes);
  const TeacherGuide = TeacherGuideFactory(sequelize, DataTypes);
  const Language = LanguageFactory(sequelize, DataTypes);
  const GamePermissions = GamePermissionsFactory(sequelize, DataTypes);
  const GamesVersions = GamesVersionsFactory(sequelize, DataTypes);
  return {
    User,
    Game,
    Technology,
    Tracker,
    TeacherGuide,
    Language,
    GamePermissions,
    GamesVersions
  };
}
