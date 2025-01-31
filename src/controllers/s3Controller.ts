import { Request, Response } from "express";
import { uploadFileToS3 } from "../models/s3Model";
import logger from "../utils/logger";

export const uploadFile = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      message: "File uploaded successfully",
      data: uniqueFileName,
    });
  } catch (error) {
    logger.error(`Error uploading to S3: ${error}`);
    res.status(500).json({ error: "Failed to upload file" });
  }
};
