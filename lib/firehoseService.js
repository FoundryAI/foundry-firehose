'use strict';

class FirehoseService {

    /**
     * @param firehoseClient
     * @param {Logger} logger
     * @param {boolean} enabled
     */
    constructor(firehoseClient, logger, enabled) {
        this._firehoseClient = firehoseClient;
        this._logger = logger;
        this._enabled = enabled || true;
    }

    /**
     * @name FirehoseServiceReturnData
     * @type {Object}
     * @property {String} RecordId
     */

    /**
     * @param {*} data
     * @returns {Promise.<FirehoseServiceReturnData|null,Error>} - null if disabled
     */
    putRecord(data) {
        // See http://facweb.cs.depaul.edu/sjost/it211/documents/ascii-npr.htm
        // Note, we use a special ASCII seperater character so we can split data later
        if (this._enabled) {
            return this._firehoseClient.putRecord(JSON.stringify(data) + "\x1e");
        } else {
            return Promise.resolve(null);
        }
    }

}

module.exports = FirehoseService;
