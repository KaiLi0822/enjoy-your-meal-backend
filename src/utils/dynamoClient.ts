import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { config } from "./config";


// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsCredentials.accessKeyId,
    secretAccessKey: config.awsCredentials.secretAccessKey,
  },
});

// Wrap the DynamoDB client with DynamoDBDocumentClient for easier use
const dynamoDB = DynamoDBDocumentClient.from(client);

export default dynamoDB;
