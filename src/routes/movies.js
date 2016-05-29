import Movie from '../models/movie';

const projection = {
  _id: 1,
  imdb_id: 1,
  title: 1,
  year: 1,
  images: 1,
  slug: 1,
  released: 1,
  rating: 1,
  torrents: 1
};

module.exports = [{
    method: 'GET',
    path: '/movies',
    handler: (request, reply) => {
        Movie.count({}).exec().then((count) => {
            const pages = Math.round(count / 10);
            const docs = [];

            for (let i = 1; i < pages + 1; i++)
                docs.push("movies/" + i);

            return reply(docs);
        }).catch((err) => {
            return reply(err);
        });
    }
}, {
    method: 'GET',
    path: '/movies/{page}',
    handler: (request, reply) => {
        const page = request.params.page - 1;
        const offset = page * 10;

        if (request.params.page === "all") {
            Movie.aggregate([{
                $project: projection
            }, {
                $sort: {
                    title: -1
                }
            }]).exec().then((docs) => {
                return reply(docs);
            }).catch((err) => {
                return reply(err);
            });
        } else {
            let query = {};
            const data = request.query;

            if (!data.order)
                data.order = -1;

            let sort = {
                "rating.votes": parseInt(data.order, 10),
                "rating.percentage": parseInt(data.order, 10),
                "rating.watching": parseInt(data.order, 10)
            };

            if (data.keywords) {
                const words = data.keywords.split(" ");
                let regex = data.keywords.toLowerCase();
                if (words.length > 1) {
                    regex = "^";
                    for (let w in words) {
                        regex += "(?=.*\\b" + RegExp.escape(words[w].toLowerCase()) + "\\b)";
                    }
                    regex += ".+";
                }
                query.title = new RegExp(regex, "gi");
            }

            if (data.sort) {
                if (data.sort === "name") sort = {
                    "title": (parseInt(data.order, 10) * -1)
                };
                if (data.sort == "rating") sort = {
                    "rating.percentage": parseInt(data.order, 10),
                    "rating.votes": parseInt(data.order, 10)
                };
                if (data.sort == "trending") sort = {
                    "rating.watching": parseInt(data.order, 10)
                };
                if (data.sort === "updated") sort = {
                    "released": parseInt(data.order, 10)
                };
                if (data.sort === "year") sort = {
                    "year": parseInt(data.order, 10)
                };
            }

            if (data.genre && data.genre != "All") {
                query.genres = data.genre.toLowerCase();
            }

            return Movie.aggregate([{
                $sort: sort
            }, {
                $match: query
            }, {
                $project: projection
            }, {
                $skip: offset
            }, {
                $limit: 10
            }]).exec().then((docs) => {
                return reply(docs);
            }).catch((err) => {
                return reply(err);
            });
        }
    }
}]