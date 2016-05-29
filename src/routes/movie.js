import Movie from '../models/movie';
import util from '../util';

module.exports = [{
    method: 'GET',
    path: '/movie/{id}',
    handler: (request, reply) => {
        Movie.findOne({
            _id: request.params.id
        }).exec().then(movie => {
            if (movie) {
                return reply(movie);
            } else {
                return util.genericError(reply, 404, `There's no movie with the id '${request.params.id}'!`);
            }
        }).catch(err => {
            return util.genericError(reply, 500, err);
        });
    }
}]