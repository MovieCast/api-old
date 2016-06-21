import util from '../util';

module.exports = [{
    method: 'GET',
    path: '/scraper',
    handler: (request, reply) => {
        return reply({
            running: cache.get('scraper.running') || false,
            updatedAt: cache.get('scraper.updatedAt') || 'never',
            providers: cache.get('scraper.providers'),
        });
    }
}, {
    method: 'GET',
    path: '/scraper/{provider}',
    handler: (request, reply) => {
        cache.get(`scraper.providers.${request.params.provider}`, (err, provider) => {
            if (err || !provider) {
                return util.genericError(reply, 404, err || 'Not a valid provider');
            } else {
                return reply(provider);
            }
        });
    }
}]