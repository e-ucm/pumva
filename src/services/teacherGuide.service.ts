import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors/notFoundError";
import { CompleteGameGuidePermission } from "@/lib/views/guideGamesView.queries";

/**
 * Retrieves all teacher guides from the database.
 * 
 * @async
 * @function getTeacherGuides
 * @returns {Promise<Array>} Array of all teacher guide records
 * 
 * @example
 * ```typescript
 * const guides = await getTeacherGuides();
 * ```
 */
export async function getTeacherGuides(): Promise<InstanceType<typeof db.Tables.TeacherGuide>[]> {
  return db.Tables.TeacherGuide.findAll();
}

/**
 * Retrieves a single teacher guide by its composite primary key (game_id, language_id).
 * 
 * @async
 * @function getTeacherGuideById
 * @param {number} game_id - The game identifier
 * @param {number} language_id - The language identifier
 * @returns {Promise<Object|null>} The teacher guide record or null if not found
 * 
 * @example
 * ```typescript
 * const guide = await getTeacherGuideById(1, 2);
 * ```
 */
export async function getTeacherGuideById(
  game_id: number,
  language_id: number
): Promise<InstanceType<typeof db.Tables.TeacherGuide> | null> {
  return db.Tables.TeacherGuide.findOne({
    where: { game_id, language_id }
  });
}

/**
 * Creates a new teacher guide in the database.
 * 
 * @async
 * @function createTeacherGuide
 * @param {Object} teacherGuide - Teacher guide data (game_id, language_id, url required)
 * @returns {Promise<Object>} The created teacher guide record
 * 
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * const guide = await createTeacherGuide({ 
 *   game_id: 1, 
 *   language_id: 2, 
 *   url: 'https://example.com/guides/game1-es' 
 * });
 * ```
 */
export async function createTeacherGuide(
  teacherGuide: Partial<InstanceType<typeof db.Tables.TeacherGuide>>
): Promise<InstanceType<typeof db.Tables.TeacherGuide>> {
  return db.Tables.TeacherGuide.create(teacherGuide);
}

/**
 * Updates multiple teacher guides matching a condition.
 * 
 * @async
 * @function updateTeacherGuides
 * @param {Object} where - Condition to find teacher guides to update
 * @param {Object} payload - Partial teacher guide data to update
 * @returns {Promise<number>} Number of affected rows
 * 
 * @example
 * ```typescript
 * const updated = await updateTeacherGuides({ game_id: 1 }, { url: 'https://new-url.com' });
 * ```
 */
export async function updateTeacherGuides(
  where: Partial<InstanceType<typeof db.Tables.TeacherGuide>>,
  payload: Partial<InstanceType<typeof db.Tables.TeacherGuide>>
): Promise<number> {
  const [affectedRows] = await db.Tables.TeacherGuide.update(payload, { where });
  return affectedRows;
}

/**
 * Updates a single teacher guide by its composite key within a transaction.
 * 
 * @async
 * @function updateTeacherGuideById
 * @param {number} game_id - The game identifier
 * @param {number} language_id - The language identifier
 * @param {Object} payload - Partial teacher guide data to update
 * @returns {Promise<Object>} The updated teacher guide record
 * 
 * @throws {NotFoundError} If teacher guide with given keys does not exist
 * 
 * @example
 * ```typescript
 * const updated = await updateTeacherGuideById(1, 2, { url: 'https://updated-url.com' });
 * ```
 */
export async function updateTeacherGuideById(
  game_id: number,
  language_id: number,
  payload: Partial<InstanceType<typeof db.Tables.TeacherGuide>>
): Promise<InstanceType<typeof db.Tables.TeacherGuide>> {
  return db.sequelize.transaction(async (t) => {
    const teacherGuide = await db.Tables.TeacherGuide.findOne({
      where: { game_id, language_id },
      transaction: t
    });
    if (!teacherGuide) {
      throw new NotFoundError("Teacher guide not found");
    }
    await teacherGuide.update(payload, { transaction: t });
    return teacherGuide;
  });
}

/**
 * Deletes a single teacher guide by its composite key within a transaction.
 * 
 * @async
 * @function deleteTeacherGuideById
 * @param {number} game_id - The game identifier
 * @param {number} language_id - The language identifier
 * @returns {Promise<void>}
 * 
 * @throws {NotFoundError} If teacher guide with given keys does not exist
 * 
 * @example
 * ```typescript
 * await deleteTeacherGuideById(1, 2);
 * ```
 */
export async function deleteTeacherGuideById(
  game_id: number,
  language_id: number
): Promise<void> {
  return db.sequelize.transaction(async (t) => {
    const teacherGuide = await db.Tables.TeacherGuide.findOne({
      where: { game_id, language_id },
      transaction: t
    });
    if (!teacherGuide) {
      throw new NotFoundError("Teacher guide not found");
    }
    await teacherGuide.destroy({ transaction: t });
  });
}

/**
 * Deletes multiple teacher guides matching a condition.
 * 
 * @async
 * @function deleteTeacherGuides
 * @param {Object} where - Condition to find teacher guides to delete
 * @returns {Promise<number>} Number of deleted rows
 * 
 * @example
 * ```typescript
 * const deleted = await deleteTeacherGuides({ game_id: 1 });
 * ```
 */
export async function deleteTeacherGuides(
  where: Partial<InstanceType<typeof db.Tables.TeacherGuide>>
): Promise<number> {
  return db.Tables.TeacherGuide.destroy({ where });
}

/**
 * Retrieves teacher guides with user permissions for a specific user and game.
 * Uses the database view to get aggregated data including languages and permissions.
 * 
 * @async
 * @function getTeacherGuidesByUserAndGame
 * @param {number} user_id - The user identifier
 * @param {number} game_id - The game identifier
 * @returns {Promise<Array>} Array of teacher guide records with permission information
 * 
 * @example
 * ```typescript
 * const guides = await getTeacherGuidesByUserAndGame(123, 456);
 * ```
 */
export async function getTeacherGuidesByUserAndGame(
  user_id: number,
  game_id: number
): Promise<CompleteGameGuidePermission[]> {
  const results = await db.Functions.runViewQuery(
    db.Views.GuideGames.byUser,
    { user_id, game_id }
  );
  return results as CompleteGameGuidePermission[];
}
