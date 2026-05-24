import { Resend } from "resend";

export const sendResetEmail = async (email: string, resetLink: string) => {
    const resendApiKey = process.env.RESEND_API_KEY || "re_fP9ZcqEZ_2WSQgP3NtDJHGC5HFFYyaWVi";
    const resend = new Resend(resendApiKey);

    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Reset Your Password",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #4f46e5; text-align: center;">Password Reset Request</h2>
                    <p>Hello,</p>
                    <p>You requested to reset your password. Click the button below to set a new password. This link is valid for 15 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p>If the button doesn't work, copy and paste the link below into your browser:</p>
                    <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetLink}</p>
                    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                    <p style="font-size: 12px; color: #9ca3af;">If you did not request this, you can safely ignore this email.</p>
                </div>
            `
        });
        console.log(`[Email Sent] Password reset email successfully sent to ${email}`);
    } catch (error) {
        console.error("Failed to send reset email via Resend:", error);
    }
};
