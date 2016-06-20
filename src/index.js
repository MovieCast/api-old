import mongoose from 'mongoose';
import logger from './logger';
import config from './config';
import scraper from './scraper';
import api from './api';
import {
    CronJob
} from 'cron';

class Main {
    constructor() {
        this.config = config;
        this.logger = new logger();
        this.scraper = new scraper(config);
        this.api = new api(config);
        this.loadStorage();
        this.loadCronTasks();

        this.run();
    }

    loadStorage() {
        if(!this.config.mongo_url) {
            this.logger.error(`There was no mongo_url set, please read README.md how to set this.`);
            process.exit(1);
        }
        mongoose.connect(this.config.mongo_url);
        mongoose.connection.once('open', () => {
            this.logger.debug(`Connected to ${this.config.mongo_url}`);
        });
    }

    loadCronTasks() {
        // Run scraper every 4 hours.
        this.createCronTask('0 0 */4 * * *', this.scraper.run.bind(this.scraper));
    }

    createCronTask(cronTime, cronFn) {
        const job = new CronJob({
            cronTime: cronTime,
            onTick: () => {
                cronFn();
            },
            start: true,
            timeZone: 'America/Los_Angeles'
        });
        cronFn();
    }

    run() {
        // Init API
        this.api.startServer();
    }
}

new Main();