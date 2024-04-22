import mongoose from "mongoose";
const connectDB=async()=>{
    try {
        const connecttodb=await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB connected: ${connecttodb.connection.host}`);
    } catch (error) {
        console.log("Database cannot connect due to the error: ",error);
        process.exit(1);
    }

}
export {connectDB}