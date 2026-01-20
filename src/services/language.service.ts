import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors/notFoundError";

/**
 * Retrieves all languages from the database.
 * 
 * @async
 * @function getLanguages
 * @returns {Promise<Array>} Array of all language records
 * 
 * @example
 * ```typescript
 * const languages = await getLanguages();
 * ```
 */
export async function getLanguages(): Promise<InstanceType<typeof db.Tables.Language>[]> {
  return db.Tables.Language.findAll();
}

/**
 * Retrieves a single language by its ID.
 * 
 * @async
 * @function getLanguageById
 * @param {number} language_id - The language identifier
 * @returns {Promise<Object|null>} The language record or null if not found
 * 
 * @example
 * ```typescript
 * const language = await getLanguageById(1);
 * ```
 */
export async function getLanguageById(
  language_id: number
): Promise<InstanceType<typeof db.Tables.Language> | null> {
  return db.Tables.Language.findByPk(language_id);
}

/**
 * Creates a new language in the database.
 * 
 * @async
 * @function createLanguage
 * @param {string} language - Language name (e.g., 'English', 'Spanish')
 * @returns {Promise<Object>} The created language record
 * 
 * @throws {Error} If database operation fails
 * 
 * @example
 * ```typescript
 * const lang = await createLanguage('French');
 * ```
 */
export async function createLanguage(
  language: Partial<InstanceType<typeof db.Tables.Language>>
): Promise<InstanceType<typeof db.Tables.Language>> {
  return db.Tables.Language.create(language);
}

/**
 * Updates multiple languages matching a condition.
 * 
 * @async
 * @function updateLanguages
 * @param {Object} where - Condition to find languages to update
 * @param {Object} payload - Partial language data to update
 * @returns {Promise<number>} Number of affected rows
 * 
 * @example
 * ```typescript
 * const updated = await updateLanguages({ language: 'Español' }, { language: 'Spanish' });
 * ```
 */
export async function updateLanguages(
  where: Partial<InstanceType<typeof db.Tables.Language>>,
  payload: Partial<InstanceType<typeof db.Tables.Language>>
): Promise<number> {
  const [affectedRows] = await db.Tables.Language.update(payload, { where });
  return affectedRows;
}

/**
 * Updates a single language by language_id within a transaction.
 * 
 * @async
 * @function updateLanguageById
 * @param {number} language_id - The language identifier
 * @param {Object} payload - Partial language data to update
 * @returns {Promise<Object>} The updated language record
 * 
 * @throws {NotFoundError} If language with given ID does not exist
 * 
 * @example
 * ```typescript
 * const updated = await updateLanguageById(1, { language: 'English (US)' });
 * ```
 */
export async function updateLanguageById(
  language_id: number,
  payload: Partial<InstanceType<typeof db.Tables.Language>>
): Promise<InstanceType<typeof db.Tables.Language>> {
  return db.sequelize.transaction(async (t) => {
    const language = await db.Tables.Language.findByPk(language_id, { transaction: t });
    if (!language) {
      throw new NotFoundError("Language not found");
    }
    await language.update(payload, { transaction: t });
    return language;
  });
}

/**
 * Deletes a single language by language_id within a transaction.
 * 
 * @async
 * @function deleteLanguageById
 * @param {number} language_id - The language identifier
 * @returns {Promise<void>}
 * 
 * @throws {NotFoundError} If language with given ID does not exist
 * 
 * @example
 * ```typescript
 * await deleteLanguageById(1);
 * ```
 */
export async function deleteLanguageById(language_id: number): Promise<void> {
  return db.sequelize.transaction(async (t) => {
    const language = await db.Tables.Language.findByPk(language_id, { transaction: t });
    if (!language) {
      throw new NotFoundError("Language not found");
    }
    await language.destroy({ transaction: t });
  });
}

/**
 * Deletes multiple languages matching a condition.
 * 
 * @async
 * @function deleteLanguages
 * @param {Object} where - Condition to find languages to delete
 * @returns {Promise<number>} Number of deleted rows
 * 
 * @example
 * ```typescript
 * const deleted = await deleteLanguages({ language: 'Obsolete' });
 * ```
 */
export async function deleteLanguages(
  where: Partial<InstanceType<typeof db.Tables.Language>>
): Promise<number> {
  return db.Tables.Language.destroy({ where });
}
