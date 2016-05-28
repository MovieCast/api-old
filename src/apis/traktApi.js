import request from 'request-promise';
import logger from '../logger';

/**
 * The api fort trakt.tv get fetch movie details
 * @class TraktApi
 */
export default class TraktApi {
    constructor(config) {
        this.logger = new logger();
        this.request = request.defaults({
            "headers": {
                "Content-Type": "application/json",
                "trakt-api-version": 2,
                "trakt-api-key": config.apis.trakt.key
            },
            "gzip": true,
            "baseUrl": 'https://api-v2launch.trakt.tv'
        });
    }
    
    /**
     * Searches for the given imdb id on trakt.tv to get some informationezz.
     * @param {String} imdbId - The imdbId of the movie (Can also be a slug or trakt.tv id)
     * @return {Object} The parsed api response
     */
    getMovie(imdbId) {
        return new Promise((resolve, reject) => {
            this.request(`/movies/${imdbId}?extended=full,image`)
                .then(JSON.parse)
                .catch(reject);
        });
    }

    /**
     * Searches for the given imdb id on trakt.tv to get some informationezz.
     * @param {String} name - The name of the movie, show, season, episode or person
     * @param {String} type - The type, should be movie, show, season, episode or person
     * @return {Object} The parsed api response
     */
    search(name, type) {
        return new Promise((resolve, reject) => {
            this.request(`/search?query=${name}`)
                .then(JSON.parse)
                .catch(reject);
        });
    }
}