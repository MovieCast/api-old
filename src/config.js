import _ from 'lodash';
import logger from './logger';

const env = process.env;

export default class Config {
    get defaults() {
        return {
            server: {
                host: env.SERVER_HOST || "0.0.0.0",
                port: env.SERVER_PORT || "8000"
            },
            mongo_url: env.MONGO_URL || null,
            apis: {
                kat: {
                    baseUrl: env.KAT_API_URL || "https://kat.cr",
                    timeout: env.KAT_API_TIMEOUT || "2000"
                },
                trakt: {
                    baseUrl: env.TRAKT_API_URL || "https://api-v2launch.trakt.tv",
                    timeout: env.TRAKT_API_TIMEOUT || "2000",
                    key: env.TRAKT_API_KEY || null
                }
            },
            endpoints: {
                movies: {
                    moviesPerPage: 50
                }
            }
        }
    }

    constructor() {
        this.logger = new logger();
    }

    load() {
        this.logger.info(`Loading config, this shouldn't take too long.`);
        let config = {};
        try {
            config = _.merge(this.defaults, require('../config.json'));
        } catch (e) {
            this.logger.warn('There was no config.json found, using defaults.');
            config = this.defaults;
        } finally {
            this.logger.info(`Done with loading configs, let's continue.`);
            return config;
        }
    }
}