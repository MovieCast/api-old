import config from '../config.json';

const env = process.env;

export default {
    server: {
        host: env.SERVER_HOST || config.server ? config.server.host : null || "127.0.0.1",
        port: env.SERVER_PORT || config.server ? config.server.port : null || "8000"
    },
    mongo_url: env.MONGO_URL || config.mongo_url || null,
    apis: {
        kat: {
            baseUrl: env.APIS_KAT_URL || config.apis ? (config.apis.kat ? config.apis.kat.baseUrl || "https://kat.cr": null) : null || "https://kat.cr",
            timeout: env.APIS_KAT_TIMEOUT || config.apis ? (config.apis.kat ? config.apis.kat.timeout || "2000" : null) : null || "2000"
        },
        trakt: {
            baseUrl: env.APIS_TRAKT_URL || config.apis ? (config.apis.trakt ? config.apis.trakt.baseUrl || "https://api-v2launch.trakt.tv" : null) : null || "https://api-v2launch.trakt.tv",
            timeout: env.APIS_TRAKT_TIMEOUT || config.apis ? (config.apis.trakt ? config.apis.trakt.timeout || "2000" : null) : null || "2000",
            key: env.APIS_TRAKT_KEY || config.apis ? (config.apis.trakt ? config.apis.trakt.key : null) : null || null
        }
    },
    endpoints: {
        movies: {
            moviesPerPage: 50
        }
    }
};