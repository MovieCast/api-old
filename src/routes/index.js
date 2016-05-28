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
},
{
    method: 'GET',
    path: '/test',
    handler: (request, reply) => {
        return reply({
            server: 'moviecast-api',
            status: 'online',
            uptime: process.uptime() | 0
        });
    }
}]