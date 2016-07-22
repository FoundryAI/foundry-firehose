'use strict';

const Promise = require('bluebird');

class KinesisFirehoseClient {

    /**
     * @param {AWS.Firehose} awsFirehose
     */
    constructor(awsFirehose) {
        this._awsFirehose = awsFirehose;
    }

    /**
     * @param {string} data
     * @returns {Promise.<FirehoseServiceReturnData,Error>}
     */
    putRecord(data) {
        const record = {
            Record: {
                Data: data
            }
        };

        return new Promise((resolve, reject) => {
            this._awsFirehose.putRecord(record, (err, returnData) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(returnData);
                }
            });
        });
    }

}

module.exports = KinesisFirehoseClient;
