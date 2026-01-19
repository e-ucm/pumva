import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Clears all data from the database tables.
 * Deletes data in dependency order to respect foreign key constraints.
 * 
 * @async
 * @function clearDatabase
 * @returns {Promise<void>}
 * 
 * @example
 * ```typescript
 * await clearDatabase();
 * ```
 */
export async function clearDatabase() {
  await db.Tables.TeacherGuide.destroy({ where: {} });
  await db.Tables.GamesVersions.destroy({ where: {} });
  await db.Tables.Language.destroy({ where: {} });
  await db.Tables.Game.destroy({ where: {} });
  await db.Tables.Tracker.destroy({ where: {} });
  await db.Tables.Technology.destroy({ where: {} });
  await db.Tables.User.destroy({ where: {} });
}

/**
 * Creates and inserts randomly generated users into the database.
 * 
 * @async
 * @function seedUsers
 * @param {number} [count=50] - Number of users to generate and insert
 * @returns {Promise<void>}
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * await seedUsers(20); // Create 20 random users
 * ```
 */
export async function seedUsers(count = 50) {
  const users = Array.from({ length: count }).map(() => ({
    username: faker.internet.userName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(["admin", "researcher","teaching_assistant","teacher","student"]),
  }));

  await db.Tables.User.bulkCreate(users, { ignoreDuplicates : true });
}

/**
 * Creates and inserts randomly generated games into the database.
 * Games are assigned to existing users with a specified role (default: 'teacher').
 * 
 * @async
 * @function seedGames
 * @param {number} [count=100] - Number of games to generate
 * @param {string} [role="teacher"] - User role to filter game owners
 * @returns {Promise<void>}
 * @throws {Error} If no users with the specified role exist or database operation fails
 * 
 * @example
 * ```typescript
 * await seedGames(50, 'teacher'); // Create 50 games owned by teachers
 * ```
 */
export async function seedGames(count = 100, role = "teacher") {
  const owners = await db.Tables.User.findAll({ where: { role: role } });
  if (owners.length === 0) {
    throw new Error(`No ${role} users found. Please seed users first.`);
  }
  const type = [ "WEB", "DESKTOP" ];
  const dbTechnos = await db.Tables.Technology.findAll();
   // Create lookup maps
  const gameTechnologies = dbTechnos.reduce((acc, tech) => {
    acc[tech.technology] = tech.technology_id;
    return acc;
  }, {} as Record<string, number>);
  logger.info(gameTechnologies);
  // Create lookup maps
  const dbGameTrackers = await db.Tables.Tracker.findAll();
  const gameTrackers = dbGameTrackers.reduce((acc, tracker) => {
    acc[tracker.technology_id] = tracker.tracker_id;
    return acc;
  }, {} as Record<number, number>);
  logger.info(gameTrackers);
  const games = Array.from({ length: count }).map(() => {
    const tech_id = faker.helpers.arrayElement(Object.values(gameTechnologies));
    return {
      public : faker.datatype.boolean(),
      actual : null,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      owner_id: faker.helpers.arrayElement(owners).user_id,
      type : faker.helpers.arrayElement(type),
      technology_id: tech_id || null,
      tracker_id: gameTrackers[tech_id] || null,
    };
  });
  logger.info(games);
  await db.Tables.Game.bulkCreate(games, { ignoreDuplicates : true });
}

/**
 * Creates and inserts technology entries into the database.
 * Populates a predefined list of game engines and development technologies.
 * 
 * @async
 * @function seedTechnologies
 * @param {number} [count=7] - Number of technologies to insert (max 7 available)
 * @returns {Promise<void>}
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * await seedTechnologies(7); // Insert all 7 predefined technologies
 * ```
 */
export async function seedTechnologies(count = 7) {
  const technologies = [ "Unity", "Unreal Engine", "Godot", "CryEngine", "GameMaker Studio", "RPG Maker", "Phaser" ];
  await db.Tables.Technology.bulkCreate(technologies.slice(0, count).map(tech => ({ technology: tech })), { ignoreDuplicates : true });
}

/**
 * Creates and inserts tracker entries into the database.
 * Associates trackers with technologies for game analytics.
 * 
 * @async
 * @function seedTrackers
 * @param {number} [count=2] - Number of trackers to insert (max 2 predefined)
 * @returns {Promise<void>}
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * await seedTrackers(2); // Insert all predefined trackers
 * ```
 */
export async function seedTrackers(count = 2) {
  const dbTechnos = await db.Tables.Technology.findAll();
  const trackers = { "Unity" : "Xasu", "Phaser" : "JSTracker" };
  const trackersArray = Object.entries(trackers).slice(0, count);
  const dbtrackers=trackersArray.map(([tech, tracker]) => {
    const techObj = dbTechnos.find(t => t.technology === tech);
    return {
      technology_id: techObj ? techObj.technology_id : null,
      tracker: tracker
    };
  });
  //for (const row of dbtrackers) {
  //  await db.Tables.Tracker.upsert(row);
  //}
  await db.Tables.Tracker.bulkCreate(dbtrackers, { ignoreDuplicates : true });
}

/**
 * Creates and inserts game version records into the database.
 * Randomly assigns versions to existing games.
 * 
 * @async
 * @function seedGameVersions
 * @param {number} [count=100] - Number of game versions to generate
 * @returns {Promise<void>}
 * @throws {Error} If no games exist or database operation fails
 * 
 * @example
 * ```typescript
 * await seedGameVersions(200); // Create 200 random game versions
 * ```
 */
export async function seedGameVersions(count = 100) {
  // Implement game version seeding if needed
  const dbGames = await db.Tables.Game.findAll();
  if (dbGames.length === 0) {
    throw new Error("No games found. Please seed games first.");
  }
  const gamesVersions = Array.from({ length: count }).map(() => {
    return {
      game_id : faker.helpers.arrayElement(dbGames).game_id,
      version : faker.system.semver(),
      external_url : faker.internet.url(),
    };
  });
  await db.Tables.GamesVersions.bulkCreate(gamesVersions, { ignoreDuplicates : true });
} 

/**
 * Creates and inserts language entries into the database.
 * Randomly selects from a predefined list of common languages.
 * 
 * @async
 * @function seedLanguages
 * @param {number} [count=100] - Number of language entries to generate
 * @returns {Promise<void>}
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * await seedLanguages(12); // Create 12 language entries
 * ```
 */
export async function seedLanguages(count = 100) {
  const languages = Array.from({ length: count }).map(() => {
    return {
      language : faker.helpers.arrayElement(["English", "Spanish", "French", "German", "Italian", "Chinese", "Japanese", "Korean", "Russian", "Portuguese", "Arabic", "Hindi"]),
    };
  });
  await db.Tables.Language.bulkCreate(languages, { ignoreDuplicates : true });
}


/**
 * Creates and inserts teacher guide records into the database.
 * Randomly matches existing games and languages.
 * 
 * @async
 * @function seedTeachersGuides
 * @param {number} [count=100] - Number of teacher guides to generate
 * @returns {Promise<void>}
 * @throws {Error} If no games or languages exist or database operation fails
 * 
 * @example
 * ```typescript
 * await seedTeachersGuides(50); // Create 50 random teacher guides
 * ```
 */
export async function seedTeachersGuides(count = 100) {
  const dbGames = await db.Tables.Game.findAll();
  if (dbGames.length === 0) {
    throw new Error("No games found. Please seed games first.");
  }
  const dbLanguages = await db.Tables.Language.findAll();
  if (dbLanguages.length === 0) {
    throw new Error("No languages found. Please seed languages first.");
  }
  const guides = Array.from({ length: count }).map(() => {
    return {
      game_id : faker.helpers.arrayElement(dbGames).game_id,
      language_id : faker.helpers.arrayElement(dbLanguages).language_id,
      url : faker.internet.url(),
    };
  });
  await db.Tables.TeacherGuide.bulkCreate(guides, { ignoreDuplicates : true });
}

/**
 * Creates and inserts game permission records into the database.
 * Randomly assigns permissions (READ, WRITE) between users and games.
 * 
 * @async
 * @function seedUserPermision
 * @param {number} [count=100] - Number of permission records to generate
 * @returns {Promise<void>}
 * @throws {Error} If no games or users exist or database operation fails
 * 
 * @example
 * ```typescript
 * await seedUserPermision(200); // Create 200 random game permissions
 * ```
 */
export async function seedUserPermision(count = 100) {
  const dbGames = await db.Tables.Game.findAll();
  if (dbGames.length === 0) {
    throw new Error("No games found. Please seed games first.");
  }
  const dbUsers = await db.Tables.User.findAll();
  if (dbUsers.length === 0) {
    throw new Error("No users found. Please seed users first.");
  }
  const gamesPermissions = Array.from({ length: count }).map(() => {
    return {
      game_id : faker.helpers.arrayElement(dbGames).game_id,
      user_id : faker.helpers.arrayElement(dbUsers).user_id,
      permission : faker.helpers.arrayElement(["READ", "WRITE"]),
    };
  });
  await db.Tables.GamePermissions.bulkCreate(gamesPermissions, { ignoreDuplicates : true });
}

/**
 * Main seeding function that orchestrates all database population.
 * Clears existing data and then seeds all tables in the correct order.
 * 
 * @async
 * @function seedFakeData
 * @returns {Promise<void>}
 * @throws {Error} If any seeding step fails
 * 
 * @example
 * ```typescript
 * // Run: npm run seed
 * await seedFakeData();
 * ```
 */
export async function seedFakeData() {
  logger.info("Starting database seeding...");
  await clearDatabase();
  logger.info("Cleared database.");

  await seedUsers(20);
  logger.info("Seeded 20 users.");
  await seedTechnologies();
  logger.info("Seeded technologies.");
  await seedTrackers();
  logger.info("Seeded trackers.");
  await seedGames(100);
  logger.info("Seeded 100 games.");
  await seedGameVersions(200);
  logger.info("Seeded 200 game versions.");
  await seedLanguages(10);
  logger.info("Seeded 10 languages.");
  await seedTeachersGuides(50);
  logger.info("Seeded 50 teacher's guides.");
  await seedUserPermision(200);
  logger.info("Seeded 200 users games permissions.");
}