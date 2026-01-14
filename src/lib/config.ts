import path from 'path';
let config: any = {}

let ignored_ports = [80, 8080, 443];

config.external_url = process.env.PUMVA_HOST || 'https://simva.external.test'
config.favicon_file = process.env.PUMVA_FAVICON || '/favicon.ico'
config.favicon_url = config.external_url + config.favicon_file
config.debug = process.env.DEBUG
config.appFolder = process.env.APP_FOLDER || '/home/node/app'

config.db = {}
config.db.path = process.env.SQLLITE_DB_PATH || '/data/db/'
config.db.file = process.env.SQLLITE_DB_FILE || 'pumva_data.db'

config.api = {}
config.api.host = process.env.PUMVA_HOST || 'simva-api.simva.external.test'
config.api.port  = process.env.PUMVA_PORT || 443
config.api.protocol = process.env.PUMVA_PROTOCOL
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