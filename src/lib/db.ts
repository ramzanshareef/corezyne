import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error('MONGODB_URI not defined!');

declare global {
    var mongoose: any;
}

let cached = global.mongoose || { conn: null, promise: null };

export const connectToDB = async () => {
    if (cached.conn) return cached.conn;

    const opts = {
        dbName: 'corezyne_main',
        bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
    cached.conn = await cached.promise;
    return cached.conn;
};

export const getClientDB = async (slug: string) => {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI!, {
            dbName: "corezyne_main",
        });
    }
    return mongoose.connection.useDb(`client_${slug}`);
};  