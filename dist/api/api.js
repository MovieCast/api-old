'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    function _class(options) {
        _classCallCheck(this, _class);

        this.server = new _hapi2.default.Server();

        this.server.connection({
            host: options.host,
            port: options.port
        });

        this.loadedRoutes = false;
    }

    _createClass(_class, [{
        key: 'loadRoutes',
        value: function loadRoutes() {
            // TODO
            this.server.route({
                method: 'GET',
                path: '/',
                handler: function handler(request, reply) {
                    return reply({
                        server: 'moviecast-api',
                        status: 'online',
                        uptime: process.uptime() | 0
                    });
                }
            });

            this.loadedRoutes = true;
        }
    }, {
        key: 'startServer',
        value: function startServer() {
            var _this = this;

            if (!this.loadedRoutes) throw new Error('You need to load the routes first!');
            this.server.start(function (err) {
                if (err) {
                    throw err;
                }
                console.log('Server running at:', _this.server.info.uri);
            });
        }
    }]);

    return _class;
}();

exports.default = _class;