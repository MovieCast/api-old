// To support generators
import "babel-polyfill";

import async from 'async-q';
import katApi from '../apis/katApi';
import traktApi from '../apis/traktApi';
import logger from '../logger';
import util from '../util';
import config from '../../config.json';
import Movie from '../models/movie';

/**
 * The provider to get kat.cr movies.
 * (Based on the kat provider of popcorn-api)
 * @class KatProvider
 */
export default class KatProvider {
    constructor(query) {
        this.logger = new logger();
        this.util = new util();
        this.katApi = new katApi();
        this.traktApi = new traktApi();

        this.query = query;
        this.query.page = 1;
        this.query.category = 'movies';
        this.query.verified = 1;
        this.query.adult_filter = 1;
    }

    /**
     * Saves/updates the given movie in the database.
     * @param {Object} movie - The movie object
     * @return {Object} The saved movie object
     */
    async saveMovie(movie) {
        const found = await Movie.findOne({
            _id: movie._id
        }).exec();
        if (found) {
            this.logger.debug(`${found.title} is an existing movie, updating the torrents.`)

            // Combine/update 480p torrents
            if ((!movie.torrents["480p"] && found.torrents["480p"]) || (movie.torrents["480p"] && found.torrents["480p"] && movie.torrents["480p"].seeds < found.torrents["480p"].seeds) || (movie.torrents["480p"] && found.torrents["480p"] && movie.torrents["480p"].magnet === found.torrents["480p"].magnet)) {
                movie.torrents["480p"] = found.torrents["480p"];
            }

            // Combine/update 720p torrents
            if ((!movie.torrents["720p"] && found.torrents["720p"]) || (movie.torrents["720p"] && found.torrents["720p"] && movie.torrents["720p"].seeds < found.torrents["720p"].seeds) || (movie.torrents["720p"] && found.torrents["720p"] && movie.torrents["720p"].magnet === found.torrents["720p"].magnet)) {
                movie.torrents["720p"] = found.torrents["720p"];
            }

            // Combine/update 1080p torrents
            if ((!movie.torrents["1080p"] && found.torrents["1080p"]) || (movie.torrents["1080p"] && found.torrents["1080p"] && movie.torrents["1080p"].seeds < found.torrents["1080p"].seeds) || (movie.torrents["1080p"] && found.torrents["1080p"] && movie.torrents["1080p"].magnet === found.torrents["1080p"].magnet)) {
                movie.torrents["1080p"] = found.torrents["1080p"];
            }

            return Movie.findOneAndUpdate({
                _id: movie._id
            }, movie).exec();
        } else {
            this.logger.debug(`${movie.title} is a new movie, saved.`);
            return new Movie(movie).save();
        }
    };

    /**
     * Creates a movie object with the trakt.tv metadata.
     * @param {Object} torrent - The torrent object
     * @param {regex} regex - The regex to correct the name
     * @return {Object} The created movie object
     */
    async createMovie(torrent, regex) {
        let name = torrent.title.match(regex)[1];
        if (name.endsWith(" ")) {
            name = name.substring(0, name.length - 1);
        }
        name = name.replace(/\./g, " ");
        const quality = torrent.title.match(regex)[3];

        const traktSearch = await this.traktApi.search(name, 'movie');
        if (traktSearch.length > 0 && traktSearch[0]) {
            if (traktSearch[0].type == "movie") {
                const traktMovie = await this.traktApi.getMovie(traktSearch[0].movie.ids["imdb"]);
                if (typeof traktMovie == 'object') {
                    const traktMovieWatching = await this.traktApi.getMovieWatching(traktSearch[0].movie.ids["imdb"]);
                    const movie = {
                        _id: traktMovie.ids["imdb"],
                        title: traktMovie.title,
                        year: traktMovie.year,
                        description: traktMovie.overview,
                        runtime: traktMovie.runtime,
                        rating: {
                            votes: traktMovie.votes,
                            percentage: Math.round(traktMovie.rating * 10),
                            watching: traktMovieWatching.length
                        },
                        images: {
                            fanart: traktMovie.images.fanart.full || null,
                            poster: traktMovie.images.poster.full || null,
                            banner: traktMovie.images.banner.full || null
                        },
                        country: traktMovie.language,
                        genres: traktMovie.genres.length > 0 ? traktMovie.genres : ["Unknown"],
                        released: new Date(traktMovie.released).getTime() / 1000.0,
                        trailer: traktMovie.trailer,
                        certification: traktMovie.certification,
                        torrents: {}
                    }

                    movie.torrents[quality] = {
                        magnet: torrent.magnet,
                        seeds: torrent.seeds,
                        peers: torrent.peers
                    };
                    return movie;
                } else {
                    this.logger.error(`Rip movie ${name} wasnt found on trakt.tv`);
                    return null;
                }
            } else {
                this.logger.error(`Rip movie ${name} wasnt found on trakt.tv`);
                return null;
            }
        } else {
            this.logger.error(`Rip movie ${name} wasnt found on trakt.tv`);
            return null;
        }
    }

    /**
     * Does nothing more then matching a regex to parse the movie name
     * and passing that to the createMovie() function.
     * @param {Object} torrent - The torrent object
     * @return {Object} The created movie object
     */
    getMovieData(torrent) {
        const threeDimensions = /(.*).(\d{4}).[3Dd]\D+(\d{3,4}p)/;
        const fourKay = /(.*).(\d{4}).[4k]\D+(\d{3,4}p)/;
        const withYear = /(.*).(\d{4})\D+(\d{3,4}p)/;

        if (torrent.title.match(threeDimensions)) {
            return this.createMovie(torrent, threeDimensions);
        } else if (torrent.title.match(fourKay)) {
            return this.createMovie(torrent, fourKay);
        } else if (torrent.title.match(withYear)) {
            return this.createMovie(torrent, withYear);
        } else {
            return null;
        }
    }

    /**
     * Creates a torrent list with the given pages.
     * @param {Number} totalPages - The pages to get
     * @return {Array} A list of torrents
     */
    getAllTorrents(totalPages) {
        let torrents = [];
        let query = this.query;
        return async.timesSeries(totalPages, page => {
            query.page = page + 1;
            this.logger.debug(`Fetching page ${query.page}.`);
            return this.katApi.search(query).then((result) => {
                torrents = torrents.concat(result.results);
            }).catch((err) => {
                this.logger.error(err);
                return err;
            });
        }).then((value) => {
            this.logger.debug(`Fetched ${torrents.length} torrents.`);
            return torrents;
        });
    }

    /**
     * Main function to fetch all movies.
     * @return {Array} A list of saved movies
     */
    async fetch() {
        const firstSearch = await this.katApi.search(this.query);
        const totalPages = firstSearch.totalPages;
        this.logger.debug(`Fetching ${totalPages} pages...`);
        const torrents = await this.getAllTorrents(totalPages);

        return async.mapLimit(torrents, 2, torrent => {
            this.getMovieData(torrent).then(movie => {
                return this.saveMovie(movie);
            }).catch(this.logger.error);
        });
    }
}