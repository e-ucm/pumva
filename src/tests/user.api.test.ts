import { GET, POST } from "@/api/users/route"; // route.ts
import { db } from "@/lib/db";
describe("/api/users", () => {
  beforeAll(async () => {
    try {
      await db.sequelize.sync({ force: true });
    } catch (err) {
      console.error("Sequelize sync failed:", err);
    }
  });

  afterAll(async () => {
    await db.sequelize.close();
  });
  
  it("GET returns empty array initially", async () => {
    const response = await GET(new Request("http://localhost/api/users"), { params: {} });
    const data = await response.json();
    expect(data).toEqual([]);
  });

  it("POST creates a user", async () => {
    const fakeRequest = new Request("http://localhost/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: "Charlie",
        email: "charlie@test.com",
        role: "tester",
      }),
    });

    const response = await POST(fakeRequest);
    const data = await response.json();

    expect(data.user_id).toBeDefined();
    expect(data.username).toBe("Charlie");
  });

  it("GET returns user after creation", async () => {
    const response = await GET(new Request("http://localhost/api/users"), { params: { username: "Charlie" } });
    const data = await response.json();
    expect(data.username).toBe("Charlie");
  });

  it("GET returns none user for username that doesn't exist", async () => {
    const response = await GET(new Request("http://localhost/api/users"), { params: { username: "Toto" } });
    const data = await response.json();
    expect(data).toBe(null);
  });
});
