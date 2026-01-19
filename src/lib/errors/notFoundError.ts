/**
 * Custom error class for handling "not found" scenarios.
 * Extends the standard Error class and sets the error name to "NotFoundError".
 *
 * @class NotFoundError
 * @extends {Error}
 *
 * @example
 * throw new NotFoundError("User not found");
 */
export class NotFoundError extends Error {
  /**
   * Creates a new NotFoundError instance.
   *
   * @constructor
   * @param {string} message - The error message describing what was not found
   */
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}