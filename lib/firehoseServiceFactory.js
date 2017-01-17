'use strict';

const Path = require('path');
const Joi = require('joi');
const AWS = require('aws-sdk');
const FirehoseService = require('./firehoseService');
const KinesisFirehoseClient = require('./kinesisFirehoseClient');
const LocalstorageFirehoseClient = require('./localstorageFirehoseClient');
const configSchema = require('./firehoseConfigSchema');

class FirehoseServiceFactory {

    /**
     * @param {Config} nodeConfig
     * @param {string} nodeConfigPath
     * @param {Logger} logger
     * @param {string} basePath
     * @returns {FirehoseService}
     */
    static createFromNodeConfig(nodeConfig, nodeConfigPath, logger, basePath) {
        const config = nodeConfig.get(nodeConfigPath);
        return FirehoseServiceFactory.create(config, logger, basePath);
    }

    /**
     * @name FirehoseServiceConfig
     * @property {boolean} enabled
     * @property {'kinesis'|'localstorage'} type
     * @property {string} streamName
     *
     * @property {object} [localConfig]
     * @property {string} localConfig.path - folder to put the data in - will be {localConfig.path}/{streamName}
     *
     * @property {object} [kinesisConfig]
     * @property {string} [kinesisConfig.awsAccessKey] - only necessary if type is 'kinesis'
     * @property {string} [kinesisConfig.awsSecretKey] - only necessary if type is 'kinesis'
     * @property {string} [kinesisConfig.region] - only necessary if type is 'kinesis'
     */

    /**
     * @param {FirehoseServiceConfig} config
     * @param {Logger} logger
     * @param {string} basePath
     * @returns {FirehoseService}
     */
    static create(config, logger, basePath) {
        const validateResult = Joi.validate(config, configSchema);
        if (validateResult.error) {
            throw validateResult.error;
        }

        const firehoseClient = config.type === 'kinesis' ? Internals.createKinesisFirehoseClient(config) : Internals.createLocalstorageFirehoseClient(config, basePath);
        return new FirehoseService(firehoseClient, logger, config.enabled);
    }

}

module.exports = FirehoseServiceFactory;

class Internals {

    /**
     * @param {FirehoseServiceConfig} config
     * @returns {*}
     */
    static createKinesisFirehoseClient(config) {
        const firehoseConfig = {
            accessKeyId: config.kinesisConfig.awsAccessKey,
            secretAccessKey: config.kinesisConfig.awsSecretKey,
            region: config.kinesisConfig.region,
            apiVersion: '2015-08-04',
            params: {
                DeliveryStreamName: config.streamName
            }
        };

        if (config.kinesisConfig.endpoint) {
          firehoseConfig.endpoint = config.kinesisConfig.endpoint;
        }

        const awsFirehose = new AWS.Firehose(firehoseConfig);

        return new KinesisFirehoseClient(awsFirehose);
    }

    /**
     * @param {FirehoseServiceConfig} config
     * @param {string} basePath
     */
    static createLocalstorageFirehoseClient(config, basePath) {
        const path = Path.join(basePath, config.localConfig.path, config.streamName);
        return new LocalstorageFirehoseClient(path);
    }

}
