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
        this.katApi = new katApi(config);
        this.traktApi = new traktApi(config);

        this.query = query;
        this.query.page = 1;
        this.query.category = 'movies';
        this.query.verified = 1;
        this.query.adult_filter = 1;
    }

    async saveMovie(movie) {

        const found = await Movie.findOne({
            _id: movie._id
        }).exec();
        if (found) {
            this.logger.debug(`${found.title} is an existing movie, combining qualities...`)

            // Combine qualities
            if ((!movie.torrents["480p"] && found.torrents["480p"]) || (movie.torrents["480p"] && found.torrents["480p"] && movie.torrents["480p"].seeds < found.torrents["480p"].seeds) || (movie.torrents["480p"] && found.torrents["480p"] && movie.torrents["480p"].magnet === found.torrents["480p"].magnet)) {
                movie.torrents["0"] = found.torrents["480p"];
                movie.torrents["480p"] = found.torrents["480p"];
            }
            if ((!movie.torrents["720p"] && found.torrents["720p"]) || (movie.torrents["720p"] && found.torrents["720p"] && movie.torrents["720p"].seeds < found.torrents["720p"].seeds) || (movie.torrents["720p"] && found.torrents["720p"] && movie.torrents["720p"].magnet === found.torrents["720p"].magnet)) {
                movie.torrents["720p"] = found.torrents["720p"];
            }
            if ((!movie.torrents["1080p"] && found.torrents["1080p"]) || (movie.torrents["1080p"] && found.torrents["1080p"] && movie.torrents["1080p"].seeds < found.torrents["1080p"].seeds) || (movie.torrents["1080p"] && found.torrents["1080p"] && movie.torrents["1080p"].magnet === found.torrents["1080p"].magnet)) {
                movie.torrents["1080p"] = found.torrents["1080p"];
            }

            return Movie.findOneAndUpdate({
                _id: movie._id
            }, movie).exec();
        } else {
            this.logger.debug(`${movie.title} is a new movie.`);
            return new Movie(movie).save();
        }
    };

    async createMovie(torrent, regex) {
        let name = torrent.title.match(regex)[1];
        if (name.endsWith(" ")) {
            name = name.substring(0, name.length - 1);
        }
        name = name.replace(/\./g, " ");
        let slug = name.replace(/\s+/g, "-").toLowerCase();
        const quality = torrent.title.match(regex)[3];

        const traktSearch = await this.traktApi.search(name, 'movie');
        if (traktSearch.length > 0 && traktSearch[0]) {
            if(traktSearch[0].type == "movie") {
                const traktMovie = await this.traktApi.getMovie(traktSearch[0].movie.ids["imdb"]);
                if(typeof traktMovie == 'object') {
                    const movie = {
                        _id: traktMovie.ids["imdb"],
                        imdb_id: traktMovie.ids["imdb"],
                        title: traktMovie.title,
                        year: traktMovie.year,
                        slug: traktMovie.ids["slug"],
                        synopsis: traktMovie.overview,
                        runtime: traktMovie.runtime,
                        rating: {
                            votes: traktMovie.votes,
                            percentage: Math.round(traktMovie.rating * 10)
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
                }
            } else {
                this.logger.error(`Rip movie ${name} wasnt found on trakt.tv`);
            }
        } else {
            this.logger.error(`Rip movie ${name} wasnt found on trakt.tv`);
        }


        return null;
    }

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

    getAllMovies(torrents) {
        return new Promise((resolve, reject) => {
            const movies = [];
            async.mapLimit(torrents, 10, torrent => {
                this.logger.debug(`Getting movie data of movie ${torrent.title}`);
                this.getMovieData(torrent).then(movie => {
                    //console.log(movie);
                    if (movie) {
                        this.logger.debug(`Fetching movie ${movie.title}`);
                        if (movies.length != 0) {
                            const matching = movies.filter((m) => {
                                return m.title === movie.title && m.slug === movie.slug;
                            });

                            if (matching.length != 0) {
                                const index = movies.indexOf(matching[0]);
                                if (!matching[0].torrents[movie.quality]) {
                                    matching[0].torrents[movie.quality] = movie.torrents[movie.quality];
                                }

                                movies.splice(index, 1, matching[0]);
                            } else {
                                this.logger.debug(`Added ${movie.title} to movies list, currently I have ${movies.length} movies fetched..`);
                                movies.push(movie);
                            }
                        } else {
                            this.logger.debug(`Added ${movie.title} to movies list, currently I have ${movies.length} movies fetched..`);
                            movies.push(movie);
                        }
                    } else {
                        this.logger.error(`An error occured while fetching data for the movie ${torrent.title}, skipping it!`);
                    }
                })
            }).then((value) => {
                resolve(movies);
            });
        }):
    }

    getAllTorrents(totalPages) {
        let torrents = [];
        let query = this.query;
        return async.timesSeries(totalPages, (page) => {
            query.page = page + 1;
            this.logger.debug(`Fetching page ${query.page}...`);
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

    async fetch() {
        //const firstSearch = await this.katApi.search(this.query);
        const totalPages = 2; //firstSearch.totalPages;
        this.logger.debug(`Fetching ${totalPages} pages...`);
        const torrents = await this.getAllTorrents(totalPages);
        const movies = await this.getAllMovies(torrents);

        return async.mapSeries(movies, movie => {
            this.logger.debug(`Fetching trakt.tv info of movie ${movie.title}`);
            return this.saveMovie(movie).catch((err) => {
                return err;
            });
        });
    }
}