import { config } from "@/lib/config";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { seedGames } from "@/lib/seeds/seedFakeData";
import { CompleteGamePermission } from "@/lib/views/gamesView.queries";

/**
 * Verifies direct Sequelize interactions, view queries, and seeded data for games.
 */
describe("Sequelize + SQLite", () => {
  var user : InstanceType<typeof db.Tables.User> | null;
  var technology : InstanceType<typeof db.Tables.Technology> | null;
  var tracker : InstanceType<typeof db.Tables.Tracker> | null;

  beforeAll(async () => {
      try {
        await db.sequelize.sync({ force: true });
        await db.Functions.runSqlFile(config.db.views_sql_file);
        user = await db.Tables.User.findOne({ where: { username: "Alice" } });
        if (!user) {
          user = await db.Tables.User.create({
            username: "Alice",
            email: "alice@test.com",
            role: "tester",
          });
        }
        technology = await db.Tables.Technology.findOne({ where: { technology: "Godot" } });
        if (!technology) {
          technology = await db.Tables.Technology.create({
            technology: "Godot"
          });
        }
        tracker = await db.Tables.Tracker.findOne({ where: { technology_id: technology.technology_id, tracker: "myNewTracker" } });
        if (!tracker) {
          tracker = await db.Tables.Tracker.create({
            technology_id: technology.technology_id,
            tracker: "myNewTracker"
          });
        }
      } catch (err) {
        console.error("Sequelize sync failed:", err);
      }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("should create a game if not present", async () => {
    var game = await db.Tables.Game.findOne({ where: { name: "myGame" } });
      if (!game) {
        game = await db.Tables.Game.create({
          name: "myGame",
          description: "",
          public : false,
          owner_id: user!.user_id,
          type: "DESKTOP",
          technology_id: technology!.technology_id,
          tracker_id: tracker!.tracker_id,
        });
      }
    expect(game.game_id).toBeDefined();
    expect(game.name).toBe("myGame");
    expect(game.public).toBeFalsy();
    expect(game.description).toBe("");
    expect(game.type).toBe("DESKTOP");
    expect(game.owner_id).toBe(user!.user_id);
    expect(game.technology_id).toBe(technology!.technology_id);
    expect(tracker!.tracker_id).toBe(tracker!.tracker_id);
  });

  it("should find all games", async () => {
    const games = await db.Tables.Game.findAll();
    expect(games.length).toBeGreaterThanOrEqual(1);
    expect(games[0].name).toBe("myGame");
  });

  it("should query game by userid using view", async () => {
    try {
      const results = await db.Functions.runViewQuery(
        db.Views.Games.byUser,
        { user_id : user?.user_id }
      );
      expect(results.length).toBe(1);
      expect((results[0] as CompleteGamePermission).name).toBe("myGame");
    } catch(e) {
      logger.error(e);
      expect(e).toBeNull();
      throw e;
    }
  });

  it("generate 10 games into DB", async () => {
    await seedGames(10, user?.role);
    const games = await db.Tables.Game.findAll();
    expect(games.length).toBeGreaterThanOrEqual(10);
    expect(games[0].game_id).toBeDefined();
  });
});
