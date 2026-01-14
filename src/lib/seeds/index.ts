import { seedFakeData } from "@/lib/seeds/seedFakeData";
import { logger } from "@/lib/logger";

seedFakeData().then(() => {
  logger.info("Seeding completed.");
  process.exit(0);
}).catch((error) => {
  logger.error("Error during seeding:");
  logger.error(error);
  process.exit(1);
});