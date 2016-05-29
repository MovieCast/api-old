module.exports = [{
    method: 'GET',
    path: '/',
    handler: (request, reply) => {
        return reply({
            server: 'moviecast-api',
            status: 'online',
            uptime: process.uptime() | 0
        });
    }
}]