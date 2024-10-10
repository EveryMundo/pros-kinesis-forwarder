# PROS Kinesis Forwarder
Forwards Kinesis Stream events to another single Kinesis Stream

## Main use case
Sometimes there's the need to forward data from a Kinesis Stream from one account/region to another Kinesis Stream that might be under another account/region.

## Requirements
Deploy this code on Amazon Lambda Function using your preferred method. It could be CDK, Serverless Framework, SAML, Pulumi, or even creating a Lambda Function manually using the AWS Console, since this is a single file with 0 external dependencies (besides the ones provided by AWS).

You should deploy this lambda using the Nodejs Runtime for node versions 18x+

Set the value of the Environmental Variable **DEST_STREAM_ARN** with the FULL ARN of the Destination Kinesis Stream, the one the data will be forwareded to.

Configure your Kinesis trigger to get up to 500 records at a time.

Don't forget to configure the permissions to write to the Kineis Stream in your Lambda Function.

If the Kinesis Stream is in another account you'll also need to change the Resource based policy of that Kinesis Stream to allow your Lambda Function Role's ARN to PutRecord/PutRecords to that same Stream.

## How it works

#### Initialization 
1. When the Lambda Function first starts it will validate the env var **DEST_STREAM_ARN** and extract the region
1. With the region in hand it then creates a new instance of a Kinesis Client

#### Event calls
1. Validates the number of records in the event is not 0 or greater than 500
1. Checks if the event source ARN is not the same as the destination source ARN
1. Parses the Based 64 encoded string into a buffer then adds it to an Array
1. Sends the array to the destination Kinesis Stream