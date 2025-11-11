import {betterAuth} from "better-auth";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import clientPromise from "./mongodb-client";

const client = await clientPromise;     //resolve the MongoClient
const db = client.db();

export const auth = betterAuth({
    database: mongodbAdapter(db, {client}),
    secret: process.env.BETTER_AUTH_SECRET!,
    emailAndPassword: {
        enabled: true,

    },
});

