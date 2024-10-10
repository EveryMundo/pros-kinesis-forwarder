import { KinesisClient, PutRecordsCommand } from '@aws-sdk/client-kinesis'

class Record {
  Data
  PartitionKey

  constructor (Data, PartitionKey) {
    this.Data = Data
    this.PartitionKey = '' + PartitionKey
  }
}

export const handler = async (event) => {
  const totalRecords = event.Records.length
  if (totalRecords === 0) {
    return console.debug('No records to process', JSON.stringify(event))
  }

  if (totalRecords > 500) {
    console.error('More than 500 records! Please adjust your trigger to 500 max. Total:', totalRecords)

    throw new Error('Too many records')
  }

  console.log('Processing', totalRecords, 'records')
  const [StreamARN, kinesisClient] = config.getBoth()

  const Records = new Array(totalRecords)

  for (let i = 0; i < totalRecords; i++) {
    const record = event.Records[i]
    if (record.eventSourceARN == null || record.eventSourceARN === StreamARN) {
      console.error('Invalid eventSourceARN', record.eventSourceARN)

      throw new Error('Invalid eventSourceARN')
    }

    Records[i] = new Record(Buffer.from(record.kinesis.data, 'base64'), i)
  }

  const command = new PutRecordsCommand({ StreamARN, Records })
  const res = await kinesisClient.send(command).catch(e => e)

  if (res instanceof Error) {
    console.error('ERROR Sending data o Kinesis Streams', res)

    throw res
  }

  console.log('DONE')
}

export const config = {
  StreamARN: null,
  kinesisClient: null,
  getConfig () { return [this.StreamARN, this.kinesisClient] },
  getBoth () {
    const arnRegex = /^arn:aws:kinesis:(\w{2}-\w+-\d+):\d{12}:stream\/[a-zA-Z0-9-_]+$/
    this.StreamARN = '' + process.env.DEST_STREAM_ARN

    const [, region] = this.StreamARN.match(arnRegex) ?? []
    if (region == null) {
      console.error(`Invalid ARN [${process.env.DEST_STREAM_ARN}]! it should match ${arnRegex}`)

      throw new Error(`Invalid ARN [${process.env.DEST_STREAM_ARN}]! it should match ${arnRegex}`)
    }

    this.kinesisClient = new KinesisClient({ region })

    this.getBoth = this.getConfig

    return this.getConfig()
  }
}
