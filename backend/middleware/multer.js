import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // allow only images
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"), false);
  } else {
    cb(null, true);
  }
};

// single upload
export const singleUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // ✅ 10 MB limit
  },
  fileFilter,
}).single("file");

// multiple uploads
export const multipleUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // ✅ 10 MB per file
  },
  fileFilter,
}).array("files", 5);
