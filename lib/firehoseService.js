'use strict';

class FirehoseService {

    /**
     * @param firehoseClient
     * @param logger
     */
    constructor(firehoseClient, logger) {
        this._firehoseClient = firehoseClient;
        this._logger = logger;
    }

    /**
     * @name FirehoseServiceReturnData
     * @type {Object}
     * @property {String} RecordId
     */

    /**
     * @param {*} data
     * @returns {Promise.<FirehoseServiceReturnData,Error>}
     */
    putRecord(data) {
        // See http://facweb.cs.depaul.edu/sjost/it211/documents/ascii-npr.htm
        // Note, we use a special ASCII seperater character so we can split data later
        return this._firehoseClient.putRecord(JSON.stringify(data) + "\x1e");
    }

}

module.exports = FirehoseService;
