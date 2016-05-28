import mongoose from 'mongoose';
import logger from './logger';
import config from '../config.json';
import scraper from './scraper';
import api from './api';

class Main {
    constructor() {
        this.config = config;
        this.logger = new logger();
        this.scraper = new scraper(config);
        this.api = new api(config.server);
        
        this.loadStorage();
        
        this.run();
    }
    
    loadStorage() {
        mongoose.connect(this.config.mongo_url);
        mongoose.connection.once('open', () => {
            this.logger.debug(`Connected to ${this.config.mongo_url}`);
        });
    }
    
    run() {
        // Init API
        //this.api.loadRoutes();
        this.api.startServer(); 
        
        this.scraper.scrape().then(this.logger.debug).catch(this.logger.error);
    }
}

new Main();