import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Clear database
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
 * create random users
 * @param count number of users
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
 * create random games
 * @param count number of games
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
 * Create technology list
 */
export async function seedTechnologies() {
  const technologies = [ "Unity", "Unreal Engine", "Godot", "CryEngine", "GameMaker Studio", "RPG Maker", "Phaser" ];
  await db.Tables.Technology.bulkCreate(technologies.map(tech => ({ technology: tech })), { ignoreDuplicates : true });
}

/**
 * Create trackers list
 */
export async function seedTrackers() {
  const dbTechnos = await db.Tables.Technology.findAll();
  const trackers = { "Unity" : "Xasu", "Phaser" : "JSTracker" };
  const dbtrackers=Object.entries(trackers).map(([tech, tracker]) => {
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
 * Create games versions list
 * @param count number of games version
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
 * Create languages list
 * @param count number of languages
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
 * Create random teacher guides list
 * @param count number of teachers guides
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
 * Main function to seed into database
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