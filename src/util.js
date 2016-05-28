export default class Util {
    constructor() {

    }

    /*
     * Function for resolving generators.
     * @param {Function} generator - The generator function
     * @return {Promise} The generated promise
     */
    spawn(generator) {
        return new Promise((resolve, reject) => {
            let onResult = (lastPromiseResult) => {
                let {
                    value,
                    done
                } = generator.next(lastPromiseResult);
                if (!done) {
                    value.then(onResult, reject)
                } else {
                    resolve(value);
                }
            };
            onResult();
        });
    }
}