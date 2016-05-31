import mongoose from 'mongoose';
import logger from './logger';
import config from '../config.json';
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
        this.api = new api(config.server);

        this.loadStorage();
        this.loadCronTasks();

        this.run();
    }

    loadStorage() {
        mongoose.connect(this.config.mongo_url);
        mongoose.connection.once('open', () => {
            this.logger.debug(`Connected to ${this.config.mongo_url}`);
        });
    }

    loadCronTasks() {
        // Run scraper every 4 hours.
        this.createCronTask('0 0 */4 * * *', this.scraper.run());
    }

    createCronTask(cronTime, cronFn) {
        const job = new CronJob({
            cronTime: cronTime,
            onTick: () => {
                cronFn;
            },
            timeZone: 'America/Los_Angeles'
        });
        job.start();
    }

    run() {
        // Init API
        this.api.startServer();
    }
}

new Main();