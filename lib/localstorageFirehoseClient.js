'use strict';

const Promise = require('bluebird');
const Fs = Promise.promisifyAll(require('fs-extra'));
const Path = require('path');
const Moment = require('moment');

class LocalstorageFirehoseClient {
    
    constructor(path) {
        this._path = path;
    }

    /**
     * @param {string} data
     * @returns {Promise.<int,Error>}
     */
    putRecord(data) {

        return Promise.resolve()
            .then(() => {
                // 1) Extract time information
                const moment = Moment().utc();
                const year = moment.year();
                const month = moment.month();
                const dayOfMonth = moment.date();
                const hour = moment.hour();
                const minute = moment.minute();

                const nearest5minuteMark = minute - (minute % 5); // We're choosing to create a new file every 5 minutes

                // 2) Create the path to the file we need to create / append
                const directory = Path.resolve(this._path, ''+year, ''+month, ''+dayOfMonth, ''+hour);
                const pathToFile = Path.resolve(directory, ''+nearest5minuteMark + '.txt');

                return Fs.statAsync(pathToFile)
                .then(
                    // File already exists
                    () => Fs.appendFileAsync(pathToFile, data),

                    // File doesn't exist
                    (err) => {
                        return Promise.resolve()
                        .then(() => Fs.ensureDirAsync(directory))
                        .then(() => Fs.writeFileAsync(pathToFile, data))
                    }
                ).then(() => {
                    return {
                        RecordId:pathToFile
                    }
                });
            });
    }

}

module.exports = LocalstorageFirehoseClient;
