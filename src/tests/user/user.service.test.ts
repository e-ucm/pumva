import { createUser, getUserByUsername, getUsers, updateUsers, updateUserById, deleteUserById, deleteUsers, getUserById } from "@/services/user.service";
import { db } from "@/lib/db";
import { config } from "@/lib/config";
import { logger } from "@/lib/logger";
import { NotFoundError } from "@/lib/errors/notFoundError";

var user : InstanceType<typeof db.Tables.User> | null;
/**
 * Integration tests for user service CRUD operations and related error handling.
 */
describe("User service", () => {
  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
    } catch (err) {
      console.error("Sequelize sync failed:", err);
    }
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 100));
    await db.sequelize.close();
  });

  it("creates a user", async () => {
    user = await createUser({username:"Bob", email:"bob@test.com", role:"tester"});
    expect(user).toBeDefined();
    if(user) {
      expect(user.user_id).toBeDefined();
      expect(user.username).toBe("Bob");
      expect(user.email).toBe("bob@test.com");
      expect(user.role).toBe("tester");
    }
  });

  it("fetches users", async () => {
    const users = await getUsers();
    expect(users.length).toBeGreaterThanOrEqual(1);
  });

  it("fetches user By Id", async () => {
    const get_user = await getUserById(user!.user_id);
    expect(get_user).toBeDefined();
    expect(get_user!.user_id).toBe(user!.user_id);
    expect(get_user!.username).toBe(user!.username);
    expect(get_user!.email).toBe(user!.email);
    expect(get_user!.role).toBe(user!.role);
  });

  it("update user by Id", async () => {
    user = await updateUserById(user!.user_id, { username: "Tot" });
    expect(user).toBeDefined();
    if(user) {
      expect(user.user_id).toBeDefined();
      expect(user.username).toBe("Tot");
      expect(user.email).toBe("bob@test.com");
      expect(user.role).toBe("tester");
    }
  });
  
  it("update user by id should throw when not user id defined", async () => {
    expect.assertions(1);
    await expect(updateUserById(9999, { username: "Tot" })).rejects.toThrow(NotFoundError);
  });

  it("update users", async () => {
    const nb = await updateUsers({ role: "tester" }, { email : "tot@test.com"});
    expect(nb).toBeDefined();
    expect(nb).toBe(1);
    user = await getUserByUsername("Tot");
    if(user) {
      expect(user.user_id).toBeDefined();
      expect(user.username).toBe("Tot");
      expect(user.email).toBe("tot@test.com");
      expect(user.role).toBe("tester");
    }
  });

    it("delete users", async () => {
      const nb = await deleteUsers({ role: "tester" });
      expect(nb).toBeDefined();
      expect(nb).toBe(1);
      const users = await getUsers();
      expect(users.length).toBeGreaterThanOrEqual(0);
    });

    it("delete user by id", async () => {
      user = await createUser({username:"Charles", email:"charles@test.com", role: "tester"});
      expect(user).toBeDefined();
      await deleteUserById(user!.user_id);
      let deleted_user = await getUserByUsername("Charles");
      expect(deleted_user).toBeNull();
    });

    it("delete user by id should throw when not user id defined", async () => {
      expect.assertions(1);
      await expect(deleteUserById(user!.user_id)).rejects.toThrow(NotFoundError);
    });
});