import { Sequelize, DataTypes } from "sequelize";

import { UserFactory } from "@/lib/models/users/user.model";
import { GameFactory } from "@/lib/models/games/game.model";

import { GamePermissionsFactory } from "@/lib/models/games/gamePermissions.model";
import { GamesVersionsFactory } from "@/lib/models/games/gameVersions.model";
import { TechnologyFactory } from "@/lib/models/games/technology.model";
import { TrackerFactory } from "@/lib/models/games/tracker.model";

import { TeacherGuideFactory } from "@/lib/models/teacherGuides/teacherGuide.model";
import { LanguageFactory } from "@/lib/models/teacherGuides/languages.model";

export default function initModels(sequelize: Sequelize) {
  const Users = UserFactory(sequelize, DataTypes);
  const Game = GameFactory(sequelize, DataTypes);
  const Technology = TechnologyFactory(sequelize, DataTypes);
  const Tracker = TrackerFactory(sequelize, DataTypes);
  const TeacherGuide = TeacherGuideFactory(sequelize, DataTypes);
  const Language = LanguageFactory(sequelize, DataTypes);
  const GamePermissions = GamePermissionsFactory(sequelize, DataTypes);
  const GamesVersions = GamesVersionsFactory(sequelize, DataTypes);
  return {
    Users,
    Game,
    Technology,
    Tracker,
    TeacherGuide,
    Language,
    GamePermissions,
    GamesVersions
  };
}
