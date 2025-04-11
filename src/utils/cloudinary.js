import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file) => {
  return await cloudinary.uploader
    .upload_stream({ resource_type: 'image' }, (err, result) => {
      if (err) throw new Error('Upload failed');
      return result;
    })
    .end(file.buffer);
};
