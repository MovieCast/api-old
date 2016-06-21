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

        // Create scraper variables in cache
        //cache.set('scraper.providers', this.providers);
        cache.set('scraper.updatedAt', new Date());
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
                cache.get('scraper.providers', (err, providers) => {
                    if(!err) {
                        if(!providers) providers = [];
                        providers.push(providerName);
                        cache.set('scraper.providers', providers);
                    }
                })
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
        cache.set('status', 'Starting scraper');
        cache.set('scraper.running', true);
        for (let providerName in providerConfig) {
            let providerInstance = this.providers[providerName];
            if (providerInstance) {
                logger.info(`Starting scrape process for the provider: ${providerName}`);
                cache.set('status', `Scraping for the ${providerName} provider`);
                for (let query of providerConfig[providerName]) {
                    let provider = new providerInstance(query)
                    //provider.fetch()
                    //    .catch(logger.error);
                }
                //TODO: Check when the provider is done and change status to online
                //cache.set('status', 'online');
            }
        }
    }
}