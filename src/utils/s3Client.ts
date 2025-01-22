import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./config"; // Assume you have a config file for environment variables

// Initialize the S3 client
const s3Client = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsCredentials.accessKeyId,
    secretAccessKey: config.awsCredentials.secretAccessKey,
  },
});

export default s3Client;