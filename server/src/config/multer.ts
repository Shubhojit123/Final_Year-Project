import * as multer from "multer";

// Store files in memory instead of disk
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Optional: 5MB limit
  }
});