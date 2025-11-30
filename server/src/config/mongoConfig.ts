import mongoose from "mongoose"
import { config } from "./config";


export const connectDB  = async()=>{
    try {
        await mongoose.connect(config.mongourl.toString())
        console.log("DB Connect")
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}