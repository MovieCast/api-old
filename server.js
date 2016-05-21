'use strict';

const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 8000 
});

// Add the route
server.route({
    method: 'GET',
    path: '/movies', 
    handler: function (request, reply) {

        var movies = [
            { title: 'whatever', year: 2000 },
            { title: 'whatever 2', year: 2016 }
        ];

        return reply(movies);
    }
});

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});