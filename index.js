'use strict';

const AWS = require('aws-sdk');
const codePipeline = new AWS.CodePipeline();

exports.handler = (event, context, callback) => {
    const jobData = event['CodePipeline.job'].data;
    const jobId = event['CodePipeline.job'].id;

    function notifyJobSuccess() {
        return codePipeline.putJobSuccessResult({jobId}).promise()
            .then(() => callback(null));
    }

    function notifyJobFailure(error) {
        const params = {
            jobId: jobId,
            failureDetails: {
                message: JSON.stringify(error.message),
                type: 'JobFailed',
                externalExecutionId: context.invokeid,
            },
        };

        return codePipeline.putJobFailureResult(params).promise()
            .then(() => callback(error.message));
    }

