import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import { configDotenv } from 'dotenv';
configDotenv();     
cloudinary.config({ 
  cloud_name: process.env.CLOUDINERY_CLOUD_NAME, 
  api_key: process.env.CLOUDINERY_API_KEY, 
  api_secret: process.env.CLOUDINERY_API_SECRET, 
});
const connectcloud=async(localfilepath)=>{
    if(!localfilepath){
        console.log("localfilepath not found");
        return null;
    }
    try {
        const resposne=await cloudinary.uploader.upload(localfilepath,
        {
            resource_type: "auto",
        }) 
        console.log("file uploaded to cloudinary: ",resposne.url);
        fs.unlinkSync(localfilepath);
        return resposne;
    } catch (error) {
        fs.unlinkSync(localfilepath);
        console.log("Connection to the cloudinery failed due to the error: ",error);
    }
}
export {connectcloud}

