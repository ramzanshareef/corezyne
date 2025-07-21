"use server";

import { register, login } from "@/app/api/do/auth";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { ensureMongoUpdateSyntax } from "./core";

export async function executeOperation(
    operation: string,
    collection: mongoose.Collection,
    query: any = {},
    data: any = {},
    options: any = {},
    db: mongoose.Connection,
    session: mongoose.ClientSession
) {
    const op = operation.toLowerCase();

    const opts = session ? { ...options, session } : options;

    const operations: Record<string, Function> = {
        register: async () => {
            const { token } = await register(data, db, session);
            (await cookies()).set("ut", token, {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            return { token };
        },
        login: async () => {
            const { token } = await login(data, db, session);
            (await cookies()).set("ut", token, {
                httpOnly: true,
                secure: true,
                sameSite: "strict"
            });
            return { token };
        },
        find: async () => {
            opts.projection = {
                ...opts.projection,
                __v: 0,
                password: 0,
            };
            return collection.find(query, opts).toArray();
        },
        findone: async () => {
            opts.projection = {
                ...opts.projection,
                __v: 0,
                password: 0,
            };
            return await collection.findOne(query, opts);
        },
        findoneandupdate: async () => {
            opts.projection = {
                ...opts.projection,
                __v: 0,
                password: 0,
            };
            return await collection.findOneAndUpdate(query, ensureMongoUpdateSyntax(data), {
                ...opts,
                returnDocument: "after"
            });
        },
        insert: async () => await collection.insertOne(data, opts),
        insertone: async () => await collection.insertOne(data, opts),
        insertmany: async () => await collection.insertMany(data, opts),
        update: async () => await collection.updateOne(query, ensureMongoUpdateSyntax(data), opts),
        updateone: async () => await collection.updateOne(query, ensureMongoUpdateSyntax(data), opts),
        updatemany: async () => await collection.updateMany(query, ensureMongoUpdateSyntax(data), opts),
        delete: async () => await collection.deleteOne(query, opts),
        deleteone: async () => await collection.deleteOne(query, opts),
        deletemany: async () => await collection.deleteMany(query, opts),
        count: async () => await collection.countDocuments(query, opts),
        countdocuments: async () => await collection.countDocuments(query, opts),
        distinct: async () => await collection.distinct(data?.field || "", query, opts),
        aggregate: async () => await collection.aggregate(data?.pipeline || [], opts).toArray()
    };

    if (operations[op]) {
        return await operations[op]();
    }

    throw new Error(`Unsupported operation: ${operation}`);
}