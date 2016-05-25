import config from '../config.json'
import api from './api/api';

class Main {
    constructor() {
        this.config = config;
        this.api = new api(config.server);
        
        this.run();
    }
    
    run() {
        // Init API
        this.api.loadRoutes();
        this.api.startServer(); 
    }
}

new Main();