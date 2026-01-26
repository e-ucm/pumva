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
 * @property {Object} sso - Authentication configuration
 * 
 * @example
 * ```typescript
 * import { config } from '@/lib/config';
 * 
 * const apiUrl = config.api.url;
 * const dbPath = config.db.complete_path;
 * ```
 */
let config: any = {};

let ignored_ports = [80, 8080, 443];

config.external_url = process.env.PUMVA_HOST || 'https://simva.external.test'
config.favicon_file = process.env.PUMVA_FAVICON || '/favicon.ico'
config.favicon_url = config.external_url + config.favicon_file
config.debug = process.env.DEBUG
config.appFolder = process.env.APP_FOLDER ||  process.cwd()

config.db = {}
config.db.path = process.env.SQLLITE_DB_PATH || '/data/db'
config.db.file = process.env.SQLLITE_DB_FILE || 'pumva_data.db'
config.db.complete_path = config.db.path + "/" +  config.db.file
config.db.sql_files_subpath = process.env.SQL_FILE_PATH || 'pumva_initialize/sqlite'
config.db.sql_files_path = config.appFolder + "/" +  config.db.sql_files_subpath
config.db.schema_sql_filename = '01-schemas.sql'
config.db.schema_sql_file = config.db.sql_files_path + "/" +  config.db.schema_sql_filename
config.db.views_sql_filename = '02-views.sql'
config.db.views_sql_file = config.db.sql_files_path + "/" +  config.db.views_sql_filename

config.api = {}
config.api.host = process.env.PUMVA_HOST || 'pumva.simva.external.test'
config.api.port  = process.env.PUMVA_PORT || 3000
config.api.protocol = process.env.PUMVA_PROTOCOL || "https"
config.api.external_port  = process.env.PUMVA_EXTERNAL_PORT || 443
config.api.url = config.api.protocol + '://' + config.api.host
		+ ( (ignored_ports.indexOf(config.api.external_port) !== -1) ? '' : (':' + config.api.port) );

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

config.sso = {}
config.sso.jwt_secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
config.sso.jwt_expires_in = process.env.JWT_EXPIRES_IN || '24h'
config.sso.enabled = process.env.SSO_ENABLED !== 'false'
config.sso.realm = process.env.SSO_REALM || 'simva'
config.sso.clientId = process.env.SSO_CLIENT_ID || 'simva'
config.sso.clientSecret = process.env.SSO_CLIENT_SECRET || 'secret'
config.sso.studentAllowedRole = process.env.SSO_STUDENT_ALLOWED_ROLE !== 'false'
config.sso.teachingAssistantAllowedRole = process.env.SSO_TEACHING_ASSISTANT_ALLOWED_ROLE !== 'false'
config.sso.teacherAllowedRole = process.env.SSO_TEACHER_ALLOWED_ROLE !== 'false'
config.sso.researcherAllowedRole = process.env.SSO_RESEARCHER_ALLOWED_ROLE !== 'false'
config.sso.sslRequired = process.env.SSO_SSL_REQUIRED || 'external'
config.sso.publicClient = process.env.SSO_PUBLIC_CLIENT === 'true'
config.sso.host = process.env.SSO_HOST || 'sso.external.test'
config.sso.protocol = process.env.SSO_PROTOCOL || 'https'
config.sso.port = process.env.SSO_PORT || '443'
config.sso.url = config.sso.protocol + '://' + config.sso.host + ((ignored_ports.indexOf(Number(config.sso.port)) !== -1) ? '' : (':' + config.sso.port))
config.sso.adminUser = process.env.SSO_ADMIN_USER || 'administrator'
config.sso.adminPassword = process.env.SSO_ADMIN_PASSWORD || 'administrator'
config.sso.teacher_username = process.env.TEACHER_USERNAME || 'teacher'
config.sso.teacher_password = process.env.TEACHER_PASSWORD || 'teacher'
config.sso.admin_username = process.env.ADMIN_USERNAME || 'admin1'
config.sso.admin_password = process.env.ADMIN_PASSWORD || 'adminpass'



export { config };