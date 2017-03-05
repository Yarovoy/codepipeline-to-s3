'use strict';

const AWS = require('aws-sdk');
const codePipeline = new AWS.CodePipeline();

exports.handler = (event, context, callback) => {
    // TODO implement
    callback(null, 'Hello from Lambda');
};