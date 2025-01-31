import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import logger from "./logger"; // Import the logger
import { config } from "./config";

const SECRET_NAME = "JWT_SECRET";
const REGION = "ca-central-1"; // Ensure this matches your AWS region

const secretsClient = new SecretsManagerClient({ region: REGION,
  //   credentials: {
  //   accessKeyId: config.awsCredentials.accessKeyId,
  //   secretAccessKey: config.awsCredentials.secretAccessKey,
  // },
 });

/**
 * Fetch a secret value from AWS Secrets Manager.
 * @param secretName - Name of the secret to retrieve.
 * @returns The secret string or null if an error occurs.
 */
export const getSecret = async (secretName: string): Promise<string | null> => {
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: "AWSCURRENT", // Default version stage
      })
    );

    if (response.SecretString) {
      logger.info(`Successfully retrieved secret: ${secretName}`);
      return response.SecretString;
    }

    logger.error(`Secret ${secretName} has no value.`);
    return null;
  } catch (error) {
    logger.error(`Error retrieving secret ${secretName}: ${error}`);
    return null;
  }
};

// Fetch the JWT secret and store it in an environment variable
(async () => {
  const secret = await getSecret(SECRET_NAME);
  if (secret) {
    process.env.JWT_SECRET = JSON.parse(secret).JWT_SECRET;
    logger.info("JWT secret loaded from AWS Secrets Manager.");
  } else {
    logger.error("Failed to load JWT secret from AWS Secrets Manager.");
  }
})();
