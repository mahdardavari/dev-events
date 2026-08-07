import {MongoClient} from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

// Better Auth needs a native MongoDB client. The driver connects lazily on the
// first operation, so constructing the client performs no I/O. This keeps
// `next build` from opening a database connection during page-data collection
// (which previously made builds fail whenever MongoDB was unreachable).
const globalWithMongo = globalThis as typeof globalThis & {
    _mongoClient?: MongoClient;
};

export function getMongoClient(): MongoClient {
    if (!globalWithMongo._mongoClient) {
        globalWithMongo._mongoClient = new MongoClient(MONGODB_URI);
    }
    return globalWithMongo._mongoClient;
}
