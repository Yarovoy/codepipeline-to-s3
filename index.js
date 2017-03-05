'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');

const codePipeline = new AWS.CodePipeline();

const artifactPath = '/tmp/artifact.zip';

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

    function downloadArtifact() {
        return new Promise((resolve, reject) => {

            console.log('Downloading CodePipeline artifact.');

            const artifactData = jobData.inputArtifacts[0];

            const accessKeyId = jobData.artifactCredentials.accessKeyId;
            const secretAccessKey = jobData.artifactCredentials.secretAccessKey;
            const sessionToken = jobData.artifactCredentials.sessionToken;

            const s3 = new AWS.S3({
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
                sessionToken: sessionToken,
                params: {Bucket: artifactData.location.s3Location.bucketName},
                signatureVersion: 'v4',
            });

            const request = s3.getObject({Key: artifactData.location.s3Location.objectKey});
            request.on('error', reject);

            const writeStream = fs.createWriteStream(artifactPath);
            writeStream.on('error', reject);
            writeStream.once('finish', resolve);

            const readStream = request.createReadStream();
            readStream.on('error', reject);
            readStream.pipe(writeStream);
        });
    }

    downloadArtifact()
        .then(notifyJobSuccess)
        .catch(notifyJobFailure);
};
