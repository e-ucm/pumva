let config: any = {}

let ignored_ports = [80, 8080, 443];

config.external_url = process.env.EXTERNAL_URL || 'https://simva.external.test'
config.favicon_file = process.env.SIMVA_FRONT_FAVICON || '/favicon.ico'
config.favicon_url = config.external_url + config.favicon_file

config.api = {}
config.api.host = process.env.SIMVA_API_HOST || 'simva-api.simva.external.test'
config.api.port  = process.env.SIMVA_API_PORT || 443
config.api.protocol = process.env.SIMVA_API_PROTOCOL
config.api.url = config.api.protocol + '://' + config.api.host
		+ ( (ignored_ports.indexOf(config.api.port) !== -1) ? '' : (':' + config.api.port) );

config.shlink = {}
config.shlink.apihost = process.env.SHLINK_SERVER_HOST || 'shlink.external.test'
config.shlink.protocol = process.env.SHLINK_PROTOCOL || 'https'
config.shlink.port = process.env.SHLINK_PORT || '443'
config.shlink.apiurl =  `${config.shlink.protocol}://${config.shlink.apihost}:${config.shlink.port}`
config.shlink.apikey = process.env.SHLINK_SERVER_API_KEY || 'myapikey'

export { config };