import { createGame, getGames, getGameById, updateGames, updateGame, deleteGames, deleteGameById } from "@/services/game.service";
import { getGamesByUser } from "@/services/views.service";
import { createTechnology } from "@/services/technology.service";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { NotFoundError } from "@/lib/errors/appErrors";
import { createTracker } from "@/services/tracker.service";
import { createUser } from "@/services/user.service";


var technology : InstanceType<typeof db.Tables.Technology> | null;
var tracker : InstanceType<typeof db.Tables.Tracker> | null;
var game : InstanceType<typeof db.Tables.Game> | null;
var user : InstanceType<typeof db.Tables.User> | null;

/**
 * Integration tests for game service CRUD operations and view queries.
 */
describe("Game service", () => {
  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
      await db.Functions.runSqlFile(config.db.views_sql_file);
      technology = await createTechnology("Phaser");
      tracker = await createTracker(technology!.technology_id, "JSTracker");
      user = await createUser({username:"Alice", email:"alice@test.dev",role: "teacher"});
    } catch (err) {
      logger.error({ err }, "Sequelize sync failed");
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("creates a game", async () => {
    var gameDescription="Conectado is a video game that has been designed and developed with the aim of raising awareness on bullying and cyberbullying through emotions.";
    game = await createGame({ name: "Connectado", public: false, description: gameDescription, type: "WEB", owner_id: user!.user_id, technology_id: technology!.technology_id, tracker_id: tracker!.tracker_id});
    expect(game).toBeDefined();
    if(game) {
      expect(game.game_id).toBeDefined();
      expect(game.name).toBe("Connectado");
      expect(game.public).toBeFalsy();
      expect(game.description).toBe(gameDescription);
      expect(game.type).toBe("WEB");
      expect(game.owner_id).toBe(user!.user_id);
      expect(game.technology_id).toBe(technology!.technology_id);
      expect(game.tracker_id).toBe(tracker!.tracker_id);
    }
  });

  it("fetches games", async () => {
    const games = await getGames();
    expect(games.length).toBeGreaterThanOrEqual(1);
    expect(games[0].game_id).toBeDefined();
    expect(games[0].name).toBe("Connectado");
  });

  
  it("fetches games view by user", async () => {
    try { 
      
      const games = await getGamesByUser(user!.user_id);
      expect(games.length).toBeGreaterThanOrEqual(1);
      expect(games[0].game_id).toBeDefined();
      expect(games[0].name).toBe("Connectado");
    } catch(e) {
      logger.error(e);
      expect(e).toBeNull();
      throw e;
    }
  });

  it("update game by Id", async () => {
    game = await updateGame(game!.game_id, { name: "ConnectadoWeb" });
    expect(game).toBeDefined();
    if(game) {
      expect(game.game_id).toBeDefined();
      expect(game.name).toBe("ConnectadoWeb");
    }
  });

  it("update game by id should throw when not game id defined", async () => {
      expect.assertions(1);
      await expect(updateGame(9999, { name: "myGame" })).rejects.toThrow(NotFoundError);
  });

  it("update games", async () => {
    const nb = await updateGames({ type: "WEB" }, { public : true });
    expect(nb).toBeDefined();
    expect(nb).toBe(1);
    game = await getGameById(game!.game_id);
    if(game) {
      expect(game.game_id).toBeDefined();
      expect(game.name).toBe("ConnectadoWeb");
      expect(game.public).toBeTruthy();
    }
  });

    it("delete games", async () => {
      const nb = await deleteGames({ game_id: game!.game_id });
      expect(nb).toBeDefined();
      expect(nb).toBe(1);
      const games = await getGames();
      expect(games.length).toBeGreaterThanOrEqual(0);
      game = await getGameById(game!.game_id);
      expect(game).toBeNull();
    });

    it("delete game by id", async () => {
      game = await createGame({
        name: "MathGame",
        public: false,
        description: "game about learning math",
        type: "WEB",
        owner_id: user!.user_id,
        technology_id: technology!.technology_id,
        tracker_id: tracker!.tracker_id
      });
      expect(game).toBeDefined();
      expect(game!.game_id).toBeDefined();
      await deleteGameById(game!.game_id);
      let deleted_game = await getGameById(game!.game_id);
      expect(deleted_game).toBeNull();
    });

    it("delete game by id should throw when not game id defined", async () => {
      expect.assertions(1);
      await expect(deleteGameById(game!.game_id)).rejects.toThrow(NotFoundError);
    });
});