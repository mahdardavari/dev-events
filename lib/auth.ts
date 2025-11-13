import {betterAuth} from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import clientPromise from "./mongodb-client";
import {nextCookies} from "better-auth/next-js";

const client = await clientPromise;     //resolve the MongoClient
const db = client.db();

export const auth = betterAuth({
    database: mongodbAdapter(db, {client}),
    secret: process.env.BETTER_AUTH_SECRET!,
    emailAndPassword: {
        enabled: true,

    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
    },
    plugins: [nextCookies()] // make sure this is the last plugin in the array
});

