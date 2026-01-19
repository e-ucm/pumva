import path from 'path';

/**
 * Application configuration object.
 * 
 * Loads configuration from environment variables with sensible defaults.
 * Organizes configuration into logical groups: external_url, db, api, logger, shlink.
 * 
 * @type {Object}
 * @property {string} external_url - External URL of the application
 * @property {string} favicon_file - Path to favicon file
 * @property {string} favicon_url - Full URL to favicon
 * @property {boolean} debug - Enable debug logging
 * @property {string} appFolder - Root application folder
 * @property {Object} db - Database configuration
 * @property {Object} api - API configuration
 * @property {Object} logger - Logger configuration
 * @property {Object} shlink - Shlink service configuration
 * 
 * @example
 * ```typescript
 * import { config } from '@/lib/config';
 * 
 * const apiUrl = config.api.url;
 * const dbPath = config.db.complete_path;
 * ```
 */
let config: any = {}

let ignored_ports = [80, 8080, 443];

config.external_url = process.env.PUMVA_HOST || 'https://simva.external.test'
config.favicon_file = process.env.PUMVA_FAVICON || '/favicon.ico'
config.favicon_url = config.external_url + config.favicon_file
config.debug = process.env.DEBUG
config.appFolder = process.env.APP_FOLDER || '/home/node/app'

config.db = {}
config.db.path = process.env.SQLLITE_DB_PATH || '/data/db'
config.db.file = process.env.SQLLITE_DB_FILE || 'pumva_data.db'
config.db.complete_path = config.db.path + "/" +  config.db.file
config.db.sql_files_subpath = process.env.SQL_FILE_PATH || 'pumva_initialize/sqlite'
config.db.sql_files_path = config.appFolder + "/" +  config.db.sql_files_subpath
config.db.schema_sql_filename = '01-schema.sql'
config.db.schema_sql_file = config.db.sql_files_path + "/" +  config.db.schema_sql_filename
config.db.views_sql_filename = '02-views.sql'
config.db.views_sql_file = config.db.sql_files_path + "/" +  config.db.views_sql_filename

config.api = {}
config.api.host = process.env.PUMVA_HOST || 'pumva.simva.external.test'
config.api.port  = process.env.PUMVA_PORT || 443
config.api.protocol = process.env.PUMVA_PROTOCOL || "https"
config.api.url = config.api.protocol + '://' + config.api.host
		+ ( (ignored_ports.indexOf(config.api.port) !== -1) ? '' : (':' + config.api.port) );

config.logger = {}
config.logger.level = process.env.LOG_LEVEL || 'info'
config.logger.process_tag = process.env.PROCESS_TAG || 'main'
config.logger.folder = process.env.LOG_FOLDER || path.join(config.appFolder, '../../logs')

config.shlink = {}
config.shlink.apihost = process.env.SHLINK_SERVER_HOST || 'shlink.external.test'
config.shlink.protocol = process.env.SHLINK_PROTOCOL || 'https'
config.shlink.port = process.env.SHLINK_PORT || '443'
config.shlink.apiurl =  `${config.shlink.protocol}://${config.shlink.apihost}:${config.shlink.port}`
config.shlink.apikey = process.env.SHLINK_SERVER_API_KEY || 'myapikey'

export { config };