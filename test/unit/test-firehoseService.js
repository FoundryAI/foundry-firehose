'use strict';

const Should = require('should');
const Promise = require('bluebird');
const Path = require('path');
const Fs = require('fs');
const Sinon = require('sinon');
const rmdir = require('rmdir');
const NodeConfig = require('config');

const FirehoseServiceFactory = require('../../lib/firehoseServiceFactory');

const LoggerConfigFactory = require('hapiest-logger/lib/loggerConfigFactory');
const LoggerFactory = require('hapiest-logger/lib/loggerFactory');
const loggerConfig = LoggerConfigFactory.createFromJsObj({enabled: false});
const logger = LoggerFactory.createLogger(loggerConfig);

const basePath = Path.join(__dirname, '../unit-helper/firehoseService/localstorage');

const localstorageFirehoseService = FirehoseServiceFactory.create({
    enabled: true,
    type:'localstorage',
    streamName: 'mystream',
    localConfig: {
        path: './'
    }
}, logger, basePath);

const kinesisConfig = {
    enabled: true,
    type:'kinesis',
    streamName:'vizualai-local-development-snippet-events',
    kinesisConfig: {
        awsAccessKey: NodeConfig.get('aws.awsAccessKey'),
        awsSecretKey: NodeConfig.get('aws.awsSecretKey'),
        region: 'us-east-1'
    }
};

describe('FirehoseService', function() {

    before(() => {
       return new Promise((resolve, reject) => {
           rmdir(basePath, err => resolve())
       })
    });

    afterEach(() => {
        return new Promise((resolve, reject) => {
            rmdir(basePath, err => resolve())
        })
    });

    describe('LocalstorageFirehoseClient', function() {

        // Note, this test could fail if the two putRecord calls end up happening split across a 5-minute boundary
        // I'm guessing it won't happen very often though so not too much to worry about, just rerun
        it('Should save records to a file', function() {
            return Promise.resolve()
            .then(() => localstorageFirehoseService.putRecord({data: 'data'}))
            .then(() => localstorageFirehoseService.putRecord({data: 'moredata'}))
            .then(result => {
                Should.exist(result);
                result.should.have.property('RecordId');

                const statObj = Fs.statSync(result.RecordId);
                statObj.isFile().should.be.True();

                const fileContents = Fs.readFileSync(result.RecordId,'utf8');
                fileContents.should.eql(`{"data":"data"}\x1e{"data":"moredata"}\x1e`)
            });
        });

    });

    describe('KinesisFirehoseClient', function() {

        it('Should save records to Kinesis Firehose', function() {
            const kinesisFirehoseService = FirehoseServiceFactory.create(kinesisConfig);
            const awsPutRecordStub = Sinon.stub(kinesisFirehoseService._firehoseClient._awsFirehose, 'putRecord', (record, callback) => callback());

            return Promise.resolve()
            .then(() => kinesisFirehoseService.putRecord({data: 'data'}))
            .then(() => kinesisFirehoseService.putRecord({data: 'moredata'}))
            .then(() => {
                awsPutRecordStub.calledTwice.should.be.True();
                awsPutRecordStub.calledWith({
                    Record: {
                        Data: JSON.stringify({data: 'data'})+"\x1e"
                    }
                }).should.be.True();
                awsPutRecordStub.calledWith({
                    Record: {
                        Data: JSON.stringify({data: 'moredata'})+"\x1e"
                    }
                }).should.be.True();
            })
        });

    });

});
