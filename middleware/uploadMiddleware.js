import multer from 'multer';

// Memory storage (no disk writing)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG, WEBP are allowed.'), false);
  }
};

// Configure multer for single or multiple images
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  },
  fileFilter: fileFilter
});

// Single image upload middleware
export const uploadSingle = upload.single('image');

// Multiple images upload (max 5)
export const uploadMultiple = upload.array('images', 5);

export default upload;

