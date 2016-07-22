'use strict';

const Should = require('should');
const Path = require('path');
const NodeConfig = require('config-uncached');
const factory = require('../../lib/firehoseServiceFactory');
const LocalstorageFirehoseClient = require('../../lib/localstorageFirehoseClient');
const KinesisFirehoseClient = require('../../lib/kinesisFirehoseClient');

const LoggerConfigFactory = require('hapiest-logger/lib/loggerConfigFactory');
const LoggerFactory = require('hapiest-logger/lib/loggerFactory');
const loggerConfig = LoggerConfigFactory.createFromJsObj({enabled: false});
const logger = LoggerFactory.createLogger(loggerConfig);

const basePath = Path.join(__dirname, '../unit-helper/firehoseServiceFactory/localstorage');

describe('FirehoseServiceFactory', function() {

    describe('create', function() {

        it('Should throw an error if enabled is not provided', function() {
            let err;
            try {
                const service = factory.create({
                    type: 'localstorage',
                    streamName: 'mystream',
                    localConfig: {
                        path: './'
                    },
                    kinesisConfig: {
                        userName: 'user',
                        awsAccessKey: 'myAccessKey',
                        awsSecretKey: 'mySecretKey',
                        region: 'region'
                    }
                }, logger, basePath);
            } catch (e) {
                err = e;
            }

            Should.exist(err);
            err.isJoi.should.be.True();
            err.message.indexOf('enabled').should.be.greaterThanOrEqual(0);
        });

        it('Should throw an error if type is not localstorage or kinesis', function() {
            let err;
            try {
                const service = factory.create({
                    enabled: true,
                    type: 'something',
                    streamName: 'mystream',
                    localConfig: {
                        path: './'
                    },
                    kinesisConfig: {
                        userName: 'user',
                        awsAccessKey: 'myAccessKey',
                        awsSecretKey: 'mySecretKey',
                        region: 'region'
                    }
                }, logger, basePath);
            } catch (e) {
                err = e;
            }

            Should.exist(err);
            err.isJoi.should.be.True();
            err.message.indexOf('type').should.be.greaterThanOrEqual(0);
        });

        it('Should throw an error if streamName is not provided', function() {
            let err;
            try {
                const service = factory.create({
                    enabled: true,
                    type: 'localstorage',
                    localConfig: {
                        path: './'
                    },
                    kinesisConfig: {
                        userName: 'user',
                        awsAccessKey: 'myAccessKey',
                        awsSecretKey: 'mySecretKey',
                        region: 'region'
                    }
                }, logger, basePath);
            } catch (e) {
                err = e;
            }

            Should.exist(err);
            err.isJoi.should.be.True();
            err.message.indexOf('streamName').should.be.greaterThanOrEqual(0);
        });

        it('Should throw an error if localstorage config does not have the path property', function() {
            let err;
            try {
                const service = factory.create({
                    enabled: true,
                    type: 'localstorage',
                    streamName: 'mystream',
                    localConfig: {}
                }, logger, basePath);
            } catch (e) {
                err = e;
            }

            Should.exist(err);
            err.isJoi.should.be.True();
            err.message.indexOf('path').should.be.greaterThanOrEqual(0);
        });

        it('Should throw an error if kinesis type does not include userName in kinesisConfig', function() {
            let err;
            try {
                const service = factory.create({
                    enabled: true,
                    type: 'kinesis',
                    streamName: 'mystream',
                    localConfig: {
                        path: './'
                    },
                    kinesisConfig: {
                        awsAccessKey: 'myAccessKey',
                        awsSecretKey: 'mySecretKey',
                        region: 'region'
                    }
                }, logger, basePath);
            } catch (e) {
                err = e;
            }

            Should.exist(err);
            err.isJoi.should.be.True();
            err.message.indexOf('userName').should.be.greaterThanOrEqual(0);
        });

        it('Should throw an error if kinesis type does not include awsAccessKey in kinesisConfig', function() {
            let err;
            try {
                const service = factory.create({
                    enabled: true,
                    type: 'kinesis',
                    streamName: 'mystream',
                    localConfig: {
                        path: './'
                    },
                    kinesisConfig: {
                        userName: 'user',
                        awsSecretKey: 'mySecretKey',
                        region: 'region'
                    }
                }, logger, basePath);
            } catch (e) {
                err = e;
            }

            Should.exist(err);
            err.isJoi.should.be.True();
            err.message.indexOf('awsAccessKey').should.be.greaterThanOrEqual(0);
        });

        it('Should throw an error if kinesis type does not include awsSecretKey in kinesisConfig', function() {
            let err;
            try {
                const service = factory.create({
                    enabled: false,
                    type: 'kinesis',
                    streamName: 'mystream',
                    localConfig: {
                        path: './'
                    },
                    kinesisConfig: {
                        userName: 'user',
                        awsAccessKey: 'myAccessKey',
                        region: 'region'
                    }
                }, logger, basePath);
            } catch (e) {
                err = e;
            }

            Should.exist(err);
            err.isJoi.should.be.True();
            err.message.indexOf('awsSecretKey').should.be.greaterThanOrEqual(0);
        });

        it('Should throw an error if kinesis type does not include region in kinesisConfig', function() {
            let err;
            try {
                const service = factory.create({
                    enabled: true,
                    type: 'kinesis',
                    streamName: 'mystream',
                    localConfig: {
                        path: './'
                    },
                    kinesisConfig: {
                        userName: 'user',
                        awsAccessKey: 'myAccessKey',
                        awsSecretKey: 'mySecretKey'
                    }
                }, logger, basePath);
            } catch (e) {
                err = e;
            }

            Should.exist(err);
            err.isJoi.should.be.True();
            err.message.indexOf('region').should.be.greaterThanOrEqual(0);
        });

    });

    describe('createFromNodeConfig', function() {

        it('Should create a FirehoseService configured with a localstorage client', function() {
            const nodeConfig = getNodeConfig('config-1');
            const service = factory.createFromNodeConfig(nodeConfig, 'someFirehose', logger, basePath);
            Should.exist(service);
            service._firehoseClient.should.be.an.instanceOf(LocalstorageFirehoseClient);
            service._firehoseClient._path.should.eql(Path.join(basePath, 'somepath', 'my-stream'));
        });

        it('Should create a FirehoseService configured with a Kinesis client', function() {
            const nodeConfig = getNodeConfig('config-2');
            const service = factory.createFromNodeConfig(nodeConfig, 'someFirehose', logger, basePath);
            Should.exist(service);
            service._firehoseClient.should.be.an.instanceOf(KinesisFirehoseClient);
        });

    });

});

function getNodeConfig(configFolder) {
    const configDir = Path.join(__dirname, '../unit-helper/firehoseServiceFactory', configFolder);
    process.env.NODE_CONFIG_DIR = configDir;
    return NodeConfig(true);
}