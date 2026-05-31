import cloudinary from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload single image to Cloudinary
 * @param {string} filePath - Base64 or local path (we'll use buffer)
 * @param {string} folder - Folder in Cloudinary (e.g., 'products')
 * @returns {Promise<string>} Cloudinary URL
 */
export const uploadImage = async (fileBuffer, folder = 'ecommerce') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: folder,
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload multiple images
 * @param {Array} fileBuffers - Array of file buffers
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<string[]>} Array of URLs
 */
export const uploadMultipleImages = async (fileBuffers, folder = 'ecommerce') => {
  const uploadPromises = fileBuffers.map(buffer => uploadImage(buffer, folder));
  return Promise.all(uploadPromises);
};

/**
 * Delete image from Cloudinary by URL
 * @param {string} imageUrl - Full Cloudinary URL
 */
export const deleteImage = async (imageUrl) => {
  try {
    // Extract public ID from URL
    const parts = imageUrl.split('/');
    const filename = parts.pop().split('.')[0];
    const folder = parts[parts.length - 1];
    const publicId = `₵{folder}/₵{filename}`;
    
    await cloudinary.v2.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

export default cloudinary;
