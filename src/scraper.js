import file from 'file';
import path from 'path';
import providerConfig from '../providers.json';

/**
 * Scraps all the movies and shows from the existing providers
 * @class Scraper
 */
export default class Scraper {
    constructor() {
        this.providers = {};
        this.loadProviders();
    }

    /**
     * Loads all the providers in the providers directory.
     */
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
        logger.debug(`Loaded ${Object.keys(this.providers).length} providers`);
    }

    /**
     * Starts the scraper
     */
    run() {
        for (let providerName in providerConfig) {
            let providerInstance = this.providers[providerName];
            if (providerInstance) {
                logger.info(`Starting scrape process for the provider: ${providerName}`);
                for (let query of providerConfig[providerName]) {
                    let provider = new providerInstance(query)
                    provider.fetch()
                        .catch(logger.error);
                }
            }
        }
    }
}