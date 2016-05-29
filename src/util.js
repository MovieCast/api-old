import _ from 'lodash';
import http from 'http';

export default class Util {

    /**
     * This function returns the generic error for any endpoint
     * @param {function} reply - The handlers callback.
     * @param {Number} statusCode - The status code to be thrown with the error.
     * @param {String} message - The message to attach with the error.
     * @param {Object} data - Any extra data to add to the error response.
     */
    static genericError(reply, statusCode, message, data) {
        reply(_.merge({
            statusCode: statusCode,
            error: http.STATUS_CODES[statusCode] + '.',
            message: message
        }, data)).code(statusCode);
    }
}