import _ from 'lodash';
import hapi from 'hapi';
import path from 'path';
import file from 'file';

/**
 * Serves the api server.
 */
export default class API {
    constructor() {
        this.server = new hapi.Server();

        this.server.connection({
            host: config.server.host,
            port: config.server.port,
            router: {
                stripTrailingSlash: true
            },
            routes: {
                cors: true
            },
            state: {
                strictHeader: false
            }
        });

        this.loadRoutes();
    }

    /**
     * Loads all the endpoints.
     */
    loadRoutes() {
        let routes = [];

        file.walkSync(path.join(__dirname, "routes"), (folder, innerFolders, files) => {
            for (let file of files) {
                if (path.extname(file) !== '.js') {
                    continue;
                }
                routes.push.apply(routes, require(path.join(folder, file)));
            }
        });
        logger.debug(`Loaded ${routes.length} routes`)
        this.server.route(routes);
    }

    /**
     * Starts the api server.
     */
    startServer() {
        this.server.start((err) => {
            if (err) {
                throw err;
            }
            logger.info(`Server running at: ${this.server.info.uri}`);
        });
    }
}