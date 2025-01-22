import { Request, Response } from "express";
import s3Client from "../utils/s3Client";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "../utils/config";
import { v4 as uuidv4 } from "uuid";

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
    const uniqueFileName = `${uuidv4()}.${file.originalname}`;

    const params = {
      Bucket: config.bucket,
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Generate the signed URL for uploading
    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Respond with the unique file name
    res.status(200).json({ 
      message: 'File uploaded successfully', 
      data: uniqueFileName });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};
