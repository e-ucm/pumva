import { Game } from "../models/games/game.model";
import { Technology } from "../models/games/technology.model";
import { Tracker } from "../models/games/tracker.model";
import { db } from "@/lib/db";

/**
 * Get games
 * @returns all games
 */
export async function getGames() {
   return db.Tables.Game.findAll();
}

/**
 * Get games for a specific user_id
 * @param user_id user identifier
 * @returns all games for the specified user
 */
export async function getGamesByUser(user_id : number) {
     const results = await db.Functions.runViewQuery(
      db.Views.Users.byUsername,
      { username: "Alice" }
    );
}