import { Request, Response } from "express";
import s3Client from "../utils/s3Client";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../utils/config";
import { v4 as uuidv4 } from "uuid";
import { generateS3ReadableUrl, uploadFileToS3 } from "../models/s3Model";

export const uploadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("uploadFile")
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    // Generate a unique file name by appending a UUID
    const uniqueFileName = await uploadFileToS3(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    // Respond with the unique file name
    res.status(200).json({ 
      message: 'File uploaded successfully', 
      data: uniqueFileName });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};


/**
 * Controller to get a signed URL for downloading a file.
 */
export const getSignedUrlForFile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { key } = req.params;
    if (!key) {
      res.status(400).json({ error: "No key provided" });
      return;
    }

    // Call the model function to generate a signed URL
    const signedUrl = await generateS3ReadableUrl(key);

    // Respond with the signed URL
    res.status(200).json({
      message: "Signed URL generated successfully",
      url: signedUrl,
    });
  } catch (error) {
    console.error("Error in getSignedUrlForFile controller:", error);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
};