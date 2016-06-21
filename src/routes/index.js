import pkg from '../../package.json';

module.exports = [{
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
        return reply({
            server: pkg.name,
            version: pkg.version,
            status: cache.get('status') || 'Starting up',
            uptime: process.uptime() | 0,
            scraper: {
                running: cache.get('scraper.running') || false,
                updatedAt: cache.get('scraper.updatedAt') || 'never',
                providers: cache.get('scraper.providers'),
            }
        });
    }
}]