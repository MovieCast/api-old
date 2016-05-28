import winston from 'winston';

export default class Logger extends winston.Logger {
  constructor() {
    super({
        levels: {
            debug: 1,
            info: 2,
            warn: 3,
            error: 4
        },
        colors: {
            debug: 'green',
            info: 'blue',
            warn: 'yellow',
            error: 'red'
        }
    });
    
    this.add(winston.transports.Console, {
        level: 'error',
        prettyPrint: true,
        colorize: true,
        timestamp: true,
        handleExceptions: true
    });

    this.exitOnError = false;

  }
}