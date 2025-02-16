import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import s3Client from "../utils/s3Client";
import { config } from "../utils/config";
import { Recipe } from "../types/recipes";
import logger from "../utils/logger";

/**
 * Replace the `cover` property with a readable S3 URL for all recipes.
 */
export const enrichRecipesWithS3Urls = async (recipes: Recipe[]): Promise<Recipe[]> => {
  return await Promise.all(
    recipes.map(async (recipe) => {
      if (recipe.cover) {
        try {
          recipe.cover = await generateS3ReadableUrl(recipe.cover);
        } catch (error) {
          logger.error(
            `Failed to generate S3 URL for recipe ${recipe.name}:`,
            error
          );
          throw error;
        }
      }
      return recipe;
    })
  );
};

/**
 * Generate a readable S3 URL for a given key.
 */
export const generateS3ReadableUrl = async (key: string): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });

    // Generate a signed URL (valid for 1 hour)
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    logger.error(`Error generating S3 URL: ${error}`);
    throw new Error("Failed to generate S3 URL");
  }
};

/**
 * Upload a file to S3.
 * @param fileBuffer - Buffer of the file to be uploaded.
 * @param fileName - Original file name for reference.
 * @param fileType - MIME type of the file.
 * @returns The unique file key stored in S3.
 */
export const uploadFileToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  fileType: string
): Promise<string> => {
  try {
    // Generate a unique file name by appending a UUID
    const uniqueFileName = `${uuidv4()}.${fileName}`;

    const params = {
      Bucket: config.bucket,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    return uniqueFileName;
  } catch (error) {
    logger.error(`Error uploading to S3: ${error}`);
    throw new Error("Failed to upload file");
  }
};
