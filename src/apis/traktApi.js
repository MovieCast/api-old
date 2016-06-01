import request from 'request-promise';
import logger from '../logger';
import config from '../../config.json';

/**
 * The api fort trakt.tv get fetch movie details
 * @class TraktApi
 */
export default class TraktApi {
    constructor() {
        this.logger = new logger();
        this.request = request.defaults({
            "headers": {
                "Content-Type": "application/json",
                "trakt-api-version": 2,
                "trakt-api-key": process.env.CFG_APIS_TRAKT_KEY || config.apis.trakt.key
            },
            "gzip": true,
            "json": true,
            "baseUrl": config.apis.trakt.baseUrl,
            "timeout": parseInt(config.apis.trakt.timeout)
        });
    }

    /**
     * Gets the movie with the given imdb id.
     * @param {String} imdbId - The imdbId of the movie (Can also be a slug or trakt.tv id)
     * @return {Object} The parsed api response
     */
    getMovie(imdbId) {
        return new Promise((resolve, reject) => {
            this.request(`/movies/${imdbId}?extended=full,images`)
                .then(response => {
                    resolve(response);
                })
                .catch(reject);
        });
    }
    
    getMovieWatching(imdbId) {
        return new Promise((resolve, reject) => {
            this.request(`/movies/${imdbId}/watching`)
                .then(response => {
                    resolve(response);
                })
                .catch(reject);
        });
    }

    /**
     * Searches for the given name on trakt.tv to get some informationezz.
     * @param {String} name - The name of the movie, show, season, episode or person
     * @param {String} type - The type, should be movie, show, season, episode or person
     * @return {Object} The parsed api response
     */
    search(name, type) {
        return new Promise((resolve, reject) => {
            this.request(`/search?query=${name}&type=${type}`)
                .then(response => {
                    resolve(response);
                })
                .catch(reject);
        });
    }
}