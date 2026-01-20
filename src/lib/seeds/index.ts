import { seedFakeData } from "@/lib/seeds/seedFakeData";
import { logger } from "@/lib/logger";

/**
 * Entry point for database seeding.
 * Executes the seedFakeData function to populate the database with test data
 * and handles success/error logging with appropriate process exit codes.
 * 
 * @async
 * @example
 * // Run from command line: npm run seed
 */
seedFakeData().then(() => {
  logger.debug("Seeding completed.");
  process.exit(0);
}).catch((error : Error) => {
  logger.error("Error during seeding:");
  logger.error(error);
  process.exit(1);
});