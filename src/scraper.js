import logger from './logger';
import file from 'file';
import path from 'path';
import providerConfig from '../providers.json';

/**
 * Scraps all the movies and shows from the existing providers
 * @class Scraper
 */
export default class Scraper {
    constructor(options) {
        this.options = options;
        this.logger = new logger();

        this.providers = {};
        this.loadProviders();
    }

    loadProviders() {
        file.walkSync(path.join(__dirname, "providers"), (folder, innerFolders, files) => {
            for (let file of files) {
                if (path.extname(file) !== '.js') {
                    continue;
                }
                let providerName = file.replace(path.extname(file), '');
                if (!this.providers[providerName]) {
                    this.providers[providerName] = require(path.join(folder, file)).default;
                }
            }
        });
        this.logger.debug(`Loaded ${Object.keys(this.providers).length} providers`);
    }

    scrape() {
        return new Promise(resolve => {
            for (let providerName in providerConfig) {
                let providerInstance = this.providers[providerName];
                if (providerInstance) {
                    for (let query of providerConfig[providerName]) {
                        let provider = new providerInstance(query)
                        provider.fetch().then(results => {
                            resolve(results.length);
                        }).catch(this.logger.error);
                    }
                }
            }
        });
    }
}