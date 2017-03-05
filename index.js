'use strict';

const AWS = require('aws-sdk');
const codePipeline = new AWS.CodePipeline();

exports.handler = (event, context, callback) => {
    const jobData = event['CodePipeline.job'].data;
    const jobId = event['CodePipeline.job'].id;

