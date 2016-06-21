import NodeCache from 'node-cache';
import logger from './logger';

export default class Cache extends NodeCache {
    constructor(options) {
        super(options);
        this.logger = new logger();

        this.logger.info(`Cache loaded successfully`);
    }
}