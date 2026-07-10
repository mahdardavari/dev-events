import {betterAuth} from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import clientPromise from "./mongodb-client";
import {nextCookies} from "better-auth/next-js";
import nodemailer from "nodemailer";

const client = await clientPromise;     //resolve the MongoClient
const db = client.db();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export const auth = betterAuth({
    database: mongodbAdapter(db, {client}),
    secret: process.env.BETTER_AUTH_SECRET!,
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
            const resetUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
            await transporter.sendMail({
                from: `"DevEvent" <${process.env.GMAIL_USER}>`,
                to: user.email,
                subject: "Reset your password",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #333;">Password Reset Request</h2>
                        <p style="color: #555; line-height: 1.6;">
                            Hi ${user.name || "there"},
                        </p>
                        <p style="color: #555; line-height: 1.6;">
                            We received a request to reset your password. Click the button below to set a new password:
                        </p>
                        <a href="${resetUrl}"
                           style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                            Reset Password
                        </a>
                        <p style="color: #555; line-height: 1.6;">
                            If the button doesn't work, copy and paste this link into your browser:
                        </p>
                        <p style="color: #3b82f6; word-break: break-all; font-size: 14px;">
                            ${resetUrl}
                        </p>
                        <p style="color: #999; font-size: 12px; margin-top: 24px;">
                            If you didn't request this, you can safely ignore this email.
                        </p>
                    </div>
                `,
            });
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
    },
    plugins: [nextCookies()] // make sure this is the last plugin in the array
});

