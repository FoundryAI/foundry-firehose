'use strict';

const Joi = require('joi');

const kinesisConfigSchema = Joi.object({
    type: Joi.string().valid('kinesis').required(),
    streamName: Joi.string().required(),
    localConfig: Joi.any().optional(),
    kinesisConfig: Joi.object({
        userName: Joi.string().required(),
        awsAccessKey: Joi.string().required(),
        awsSecretKey: Joi.string().required(),
        region: Joi.string().required()
    }).required()
});

const localstorageConfigSchema = Joi.object({
    type: Joi.string().valid('localstorage').required(),
    streamName: Joi.string().required(),
    localConfig: Joi.object({
        path: Joi.string().required()
    }).required(),
    kinesisConfig: Joi.any().optional()
});

const schema = Joi.alternatives().try(kinesisConfigSchema, localstorageConfigSchema);


module.exports = schema;