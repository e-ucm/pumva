import { 
  getGamesByUser, 
  getPublicGames, 
  getTeacherGuidesByUserAndGame, 
  getUserByUsername 
} from "@/services/views.service";
import { db } from "@/lib/db";
import { config } from "@/lib/config";

// Mock the db module
jest.mock("@/lib/db");

const mockedDb = db as jest.Mocked<typeof db>;

describe("Views Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock functions
    mockedDb.Functions = {
      runViewQuery: jest.fn(),
      runSqlFile: jest.fn()
    };
    
    mockedDb.Views = {
      Games: {
        byUser: { sql: "SELECT * FROM v_complete_game_permissions WHERE user_id = :user_id", params: {} },
        publicGames: { sql: "SELECT * FROM v_public_games_permissions", params: {} }
      },
      GuideGames: {
        byUser: { sql: "SELECT * FROM v_game_guide_url_permissions WHERE user_id = :user_id AND game_id = :game_id", params: {} }
      },
      Users: {
        byUsername: { sql: "SELECT * FROM Users WHERE username = :username", params: {} }
      }
    };
  });

  describe("getGamesByUser", () => {
    it("should return games for a specific user", async () => {
      const mockGames = [
        { user_id: 1, game_id: 1, permission: "READ", name: "Test Game" },
        { user_id: 1, game_id: 2, permission: "WRITE", name: "Another Game" }
      ];

      mockedDb.Functions.runViewQuery.mockResolvedValue(mockGames);

      const result = await getGamesByUser(1);

      expect(mockedDb.Functions.runViewQuery).toHaveBeenCalledWith(
        mockedDb.Views.Games.byUser,
        { user_id: 1 }
      );
      expect(result).toEqual(mockGames);
    });

    it("should return empty array when no games found", async () => {
      mockedDb.Functions.runViewQuery.mockResolvedValue([]);

      const result = await getGamesByUser(999);

      expect(mockedDb.Functions.runViewQuery).toHaveBeenCalledWith(
        mockedDb.Views.Games.byUser,
        { user_id: 999 }
      );
      expect(result).toEqual([]);
    });
  });

  describe("getPublicGames", () => {
    it("should return all public games", async () => {
      const mockPublicGames = [
        { game_id: 1, name: "Public Game 1", public: true },
        { game_id: 2, name: "Public Game 2", public: true }
      ];

      mockedDb.Functions.runViewQuery.mockResolvedValue(mockPublicGames);

      const result = await getPublicGames();

      expect(mockedDb.Functions.runViewQuery).toHaveBeenCalledWith(
        mockedDb.Views.Games.publicGames,
        {}
      );
      expect(result).toEqual(mockPublicGames);
    });
  });

  describe("getTeacherGuidesByUserAndGame", () => {
    it("should return teacher guides for user and game", async () => {
      const mockGuides = [
        { user_id: 1, game_id: 1, language: "en", teacher_guide_url: "http://example.com/guide" }
      ];

      mockedDb.Functions.runViewQuery.mockResolvedValue(mockGuides);

      const result = await getTeacherGuidesByUserAndGame(1, 1);

      expect(mockedDb.Functions.runViewQuery).toHaveBeenCalledWith(
        mockedDb.Views.GuideGames.byUser,
        { user_id: 1, game_id: 1 }
      );
      expect(result).toEqual(mockGuides);
    });
  });

  describe("getUserByUsername", () => {
    it("should return user by username", async () => {
      const mockUser = [
        { user_id: 1, username: "testuser", email: "test@example.com" }
      ];

      mockedDb.Functions.runViewQuery.mockResolvedValue(mockUser);

      const result = await getUserByUsername("testuser");

      expect(mockedDb.Functions.runViewQuery).toHaveBeenCalledWith(
        mockedDb.Views.Users.byUsername,
        { username: "testuser" }
      );
      expect(result).toEqual(mockUser);
    });

    it("should return empty array when user not found", async () => {
      mockedDb.Functions.runViewQuery.mockResolvedValue([]);

      const result = await getUserByUsername("nonexistent");

      expect(mockedDb.Functions.runViewQuery).toHaveBeenCalledWith(
        mockedDb.Views.Users.byUsername,
        { username: "nonexistent" }
      );
      expect(result).toEqual([]);
    });
  });
});