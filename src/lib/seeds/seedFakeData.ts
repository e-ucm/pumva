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
  const users: Array<{ username: string; email: string; role: string }> = [];
  const usedUsernames = new Set<string>();
  const usedEmails = new Set<string>();
  
  let attempts = 0;
  const maxAttempts = count * 10;
  
  while (users.length < count && attempts < maxAttempts) {
    const username = faker.internet.userName();
    const email = faker.internet.email();
    
    if (!usedUsernames.has(username) && !usedEmails.has(email)) {
      usedUsernames.add(username);
      usedEmails.add(email);
      users.push({
        username,
        email,
        role: faker.helpers.arrayElement(["admin", "researcher","teaching_assistant","teacher","student"]),
      });
    }
    attempts++;
  }
  
  if (users.length < count) {
    logger.warn(`Only generated ${users.length} unique users out of ${count} requested`);
  }

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
  logger.debug(gameTechnologies);
  // Create lookup maps
  const dbGameTrackers = await db.Tables.Tracker.findAll();
  const gameTrackers = dbGameTrackers.reduce((acc, tracker) => {
    acc[tracker.technology_id] = tracker.tracker_id;
    return acc;
  }, {} as Record<number, number>);
  logger.debug(gameTrackers);
  
  const games: Array<any> = [];
  const usedNames = new Set<string>();
  
  let attempts = 0;
  const maxAttempts = count * 100;
  
  while (games.length < count && attempts < maxAttempts) {
    let name = faker.commerce.productName();
    
    // If name already exists, append a unique suffix to ensure uniqueness
    let finalName = name;
    let counter = 0;
    while (usedNames.has(finalName) && counter < 10) {
      finalName = `${name} ${faker.datatype.string(6)}`;
      counter++;
    }
    
    if (!usedNames.has(finalName)) {
      usedNames.add(finalName);
      const tech_id = faker.helpers.arrayElement(Object.values(gameTechnologies));
      games.push({
        public : faker.datatype.boolean(),
        actual : null,
        name: finalName,
        description: faker.commerce.productDescription(),
        owner_id: faker.helpers.arrayElement(owners).user_id,
        type : faker.helpers.arrayElement(type),
        technology_id: tech_id || null,
        tracker_id: gameTrackers[tech_id] || null,
      });
    }
    attempts++;
  }
  
  if (games.length < count) {
    logger.warn(`Only generated ${games.length} unique games out of ${count} requested`);
  }
  
  logger.debug(games);
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
  
  const gamesVersions: Array<{ game_id: number; version: string; external_url: string }> = [];
  const usedCombinations = new Set<string>();
  
  let attempts = 0;
  const maxAttempts = count * 10;
  
  while (gamesVersions.length < count && attempts < maxAttempts) {
    const game_id = faker.helpers.arrayElement(dbGames).game_id;
    const version = faker.system.semver();
    const key = `${game_id}-${version}`;
    
    if (!usedCombinations.has(key)) {
      usedCombinations.add(key);
      gamesVersions.push({
        game_id,
        version,
        external_url: faker.internet.url(),
      });
    }
    attempts++;
  }
  
  if (gamesVersions.length < count) {
    logger.warn(`Only generated ${gamesVersions.length} unique game versions out of ${count} requested (limited by available game-version combinations)`);
  }
  
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
  const baseLanguages = ["English", "Spanish", "French", "German", "Italian", "Chinese", "Japanese", "Korean", "Russian", "Portuguese", "Arabic", "Hindi"];
  const languages: Array<{ language: string }> = [];
  
  // First, add all unique base languages
  for (const lang of baseLanguages) {
    if (languages.length >= count) break;
    languages.push({ language: lang });
  }
  
  // If we need more, add variations with region/dialect suffixes
  const suffixes = [" (US)", " (UK)", " (CA)", " (AU)", " (Latin America)", " (Spain)", " (Brazil)", " (Portugal)", " (Simplified)", " (Traditional)", " (Formal)", " (Informal)"];
  let suffixIndex = 0;
  let langIndex = 0;
  
  while (languages.length < count) {
    const baseLang = baseLanguages[langIndex % baseLanguages.length];
    const suffix = suffixes[suffixIndex % suffixes.length];
    languages.push({ language: `${baseLang}${suffix}` });
    suffixIndex++;
    if (suffixIndex % suffixes.length === 0) {
      langIndex++;
    }
  }
  
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
  
  const guides: Array<{ game_id: number; language_id: number; url: string }> = [];
  const usedCombinations = new Set<string>();
  
  // Try to generate unique combinations
  let attempts = 0;
  const maxAttempts = count * 10; // Allow multiple attempts to find unique combinations
  
  while (guides.length < count && attempts < maxAttempts) {
    const game_id = faker.helpers.arrayElement(dbGames).game_id;
    const language_id = faker.helpers.arrayElement(dbLanguages).language_id;
    const key = `${game_id}-${language_id}`;
    
    if (!usedCombinations.has(key)) {
      usedCombinations.add(key);
      guides.push({
        game_id,
        language_id,
        url: faker.internet.url(),
      });
    }
    attempts++;
  }
  
  if (guides.length < count) {
    logger.warn(`Only generated ${guides.length} unique teacher guides out of ${count} requested (limited by available game-language combinations)`);
  }
  
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
  
  const gamesPermissions: Array<{ game_id: number; user_id: number; permission: string }> = [];
  const usedCombinations = new Set<string>();
  
  // Try to generate unique combinations
  let attempts = 0;
  const maxAttempts = count * 10; // Allow multiple attempts to find unique combinations
  
  while (gamesPermissions.length < count && attempts < maxAttempts) {
    const game_id = faker.helpers.arrayElement(dbGames).game_id;
    const user_id = faker.helpers.arrayElement(dbUsers).user_id;
    const key = `${game_id}-${user_id}`;
    
    if (!usedCombinations.has(key)) {
      usedCombinations.add(key);
      gamesPermissions.push({
        game_id,
        user_id,
        permission: faker.helpers.arrayElement(["READ", "WRITE"]),
      });
    }
    attempts++;
  }
  
  if (gamesPermissions.length < count) {
    logger.warn(`Only generated ${gamesPermissions.length} unique game permissions out of ${count} requested (limited by available game-user combinations)`);
  }
  
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
  logger.debug("Starting database seeding...");
  await clearDatabase();
  logger.debug("Cleared database.");
  await db.Tables.User.create({
      username:"teacher",
      email:"teacher@example.com",
      role: "teacher",
  });
  await seedUsers(20);
  logger.debug("Seeded 20 users.");
  await seedTechnologies();
  logger.debug("Seeded technologies.");
  await seedTrackers();
  logger.debug("Seeded trackers.");
  await seedGames(100, "teacher");
  logger.debug("Seeded 100 games.");
  await seedGameVersions(200);
  logger.debug("Seeded 200 game versions.");
  await seedLanguages(10);
  logger.debug("Seeded 10 languages.");
  await seedTeachersGuides(50);
  logger.debug("Seeded 50 teacher's guides.");
  await seedUserPermision(200);
  logger.debug("Seeded 200 users games permissions.");
}