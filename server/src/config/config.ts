import * as dotevn from "dotenv"
import * as nodemailer from "nodemailer";

dotevn.config()

interface Config{
    mongourl : String
}

export const config : Config = {
    mongourl : process.env.MONGO_URI || "mongodb://localhost:27017/FINALEAR"

};

