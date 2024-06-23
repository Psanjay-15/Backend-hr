// to upload file
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { loadavg } from "os";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_NAME,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uplaodFileOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: auto,
    });
    console.log("File is uploaded succesfully", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // removes the locally stored upload file as the operation has failled
    return null;
  }
};

export { uplaodFileOnCloudinary };
