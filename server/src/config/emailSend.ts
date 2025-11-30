import { Resend } from "resend";
import * as dotevn from "dotenv"
import { ApiResponse } from "../Base/Base_Class/Response";
dotevn.config()

export const resend = new Resend(process.env.RESEND_API_KEY || "re_fP9ZcqEZ_2WSQgP3NtDJHGC5HFFYyaWVi");

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const response:any = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: to,
            subject: subject,
            html: html
        });

        return true;
    } catch (error: any) {
        console.log("Error sending email:", error);
        return false;
    }
}