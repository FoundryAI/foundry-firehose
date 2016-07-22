'use strict';

const Should = require('should');
const Promise = require('bluebird');
const Path = require('path');
const rmdir = require('rmdir');
const NodeConfig = require('config');

const FirehoseServiceFactory = require('../../lib/firehoseServiceFactory');

const LoggerConfigFactory = require('hapiest-logger/lib/loggerConfigFactory');
const LoggerFactory = require('hapiest-logger/lib/loggerFactory');
const loggerConfig = LoggerConfigFactory.createFromJsObj({enabled: false});
const logger = LoggerFactory.createLogger(loggerConfig);

const basePath = Path.join(__dirname, '../unit-helper/firehoseService/localstorage');

const kinesisConfig = {
    type:'kinesis',
    streamName:'vizualai-local-development-snippet-events',
    kinesisConfig: {
        userName: NodeConfig.get('aws.userName'),
        awsAccessKey: NodeConfig.get('aws.awsAccessKey'),
        awsSecretKey: NodeConfig.get('aws.awsSecretKey'),
        region: 'us-east-1'
    }
};

describe('FirehoseService', function() {

    describe('KinesisFirehoseClient', function() {

        it('Should save records to Kinesis Firehose', function() {
            const kinesisFirehoseService = FirehoseServiceFactory.create(kinesisConfig, logger, basePath);

            return Promise.resolve()
                .then(() => Promise.all([
                    kinesisFirehoseService.putRecord({data: 'data'}),
                    kinesisFirehoseService.putRecord({data: 'moredata'})
                ]))
                .spread((result1, result2) => {
                    Should.exist(result1);
                    result1.should.have.property('RecordId');
                    Should.exist(result2);
                    result2.should.have.property('RecordId');
                })
        });

    });

});