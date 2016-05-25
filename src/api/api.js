import hapi from 'hapi';

export default class {
    constructor(options) {
        this.server = new hapi.Server();
        
        this.server.connection({ 
            host: options.host, 
            port: options.port 
        });
        
        this.loadedRoutes = false;
    }
    
    loadRoutes() {
        // TODO 
        this.server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {
                return reply({
                    server: 'moviecast-api',
                    status: 'online',
                    uptime: process.uptime() | 0
                });
            }
        });
        
        
        this.loadedRoutes = true;
    }
    
    startServer() {
        if(!this.loadedRoutes) throw new Error('You need to load the routes first!');
        this.server.start((err) => {
            if (err) {
                throw err;
            }
            console.log('Server running at:', this.server.info.uri);
        });
    }
}