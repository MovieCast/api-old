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
        this.loadGlobals();
        this.scraper = new scraper();
        this.api = new api();
        this.loadStorage();
        this.loadCronTasks();

        this.run();
    }

    loadGlobals() {
        // Lets make this global so we dont have to define it 200000 times.
        global.config = new config().load();
        global.logger = new logger();
    }

    loadStorage() {
        if(!global.config.mongo_url) {
            global.logger.error(`There was no mongo_url set, please read README.md how to set this.`);
            process.exit(1);
        }
        mongoose.connect(global.config.mongo_url);
        mongoose.connection.once('open', () => {
            global.logger.debug(`Connected to ${global.config.mongo_url}`);
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