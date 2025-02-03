import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import logger from "./logger"; // Import the logger

const SECRET_NAME = "JWT_SECRET";
const REGION = "ca-central-1"; // Ensure this matches your AWS region

const secretsClient = new SecretsManagerClient({
  region: REGION,
  // credentials: {
  //   accessKeyId: config.awsCredentials.accessKeyId,
  //   secretAccessKey: config.awsCredentials.secretAccessKey,
  // },
});

export const loadJWTSecret = async () => {
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: SECRET_NAME,
        VersionStage: "AWSCURRENT", // Default version stage
      })
    );

    if (response.SecretString) {
      logger.info(`Successfully retrieved secret: ${SECRET_NAME}`);
      process.env.JWT_SECRET = JSON.parse(response.SecretString).JWT_SECRET;
    } else {
      logger.error(`Secret ${SECRET_NAME} has no value.`);
    }
  } catch (error) {
    logger.error(`Error retrieving secret ${SECRET_NAME}: ${error}`);
  }
};
