import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    // upload
    const res = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    // file uploaded
    console.log("File uploaded on cloudinary!" + res.url);
    return res;
  } catch (error) {
    console.log("ERROR: File upload cloudinary failed" + error);
    fs.unlinkSync(filePath); // remove local file
    return null;
  }
};
