import multer from "multer";

const storage = multer.memoryStorage(); // Store file in memory for direct S3 upload
const upload = multer({ storage });

export default upload;
