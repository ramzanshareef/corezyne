import { GoogleGenAI } from "@google/genai";
import { getClientDB } from "@/lib/db";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cleanDynamic } from "@/lib/core";
import { executeOperation } from "@/lib/mongo-execute";
import { responseSchema } from "@/schemas/responses";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

const BLOCKED_KEYWORDS = [
    'drop', 'shutdown', 'eval', 'function', 'system', 'admin',
    'createuser', 'grantroles', 'createindex', 'createcollection',
    'fsync', 'repairdatabase', 'replset', 'getparameter', 'killop',
    'db.killop', 'db.fsynclock', 'db.createuser', 'db.auth'
];

const ALLOWED_OPERATIONS = [
    "find", "findone", "findoneandupdate", "insert", "insertone", "insertmany", "update",
    "updateone", "updatemany", "delete", "deleteone", "deletemany",
    "count", "countdocuments", "distinct", "aggregate", "register", "login"
];

export async function POST(req: Request) {
    const { command, client } = await req.json();

    if (!client) {
        return NextResponse.json({ error: "Client slug required" }, { status: 400 });
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [
                {
                    role: "model",
                    parts: [{
                        text: `You are an expert in MongoDB. You convert natural language commands into structured MongoDB operations. While returning user data any time, write query such that no personal data or password is sent back. Use "register" or "login" as operation names for auth-related actions. Allowed operations are: ${ALLOWED_OPERATIONS.join(", ")}. Do not hallucinate operations or collections. If the command is invalid or contains blocked keywords, return an error message.
                        `
                    }]
                },
                {
                    role: "user",
                    parts: [{
                        text: `Convert this natural language command  ${command}`
                    }]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const text = response.text;
        let parsed: any[];
        try {
            const out = JSON.parse(text as string);
            parsed = Array.isArray(out) ? out : [out];
        } catch {
            return NextResponse.json({ error: "Invalid JSON returned", raw: text }, { status: 500 });
        }
        console.log("Parsed commands:", parsed);
        const db = await getClientDB(client);
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            let lastResult;

            for (const mongoCommand of parsed) {
                if (!mongoCommand.operation || !ALLOWED_OPERATIONS.includes(mongoCommand.operation.toLowerCase())) {
                    await session.abortTransaction();
                    return NextResponse.json({
                        error: `Invalid or hallucinated operation: ${mongoCommand.operation}`
                    }, { status: 400 });
                }

                const commandString = JSON.stringify(mongoCommand).toLowerCase();
                if (BLOCKED_KEYWORDS.some(kw => commandString.includes(kw))) {
                    await session.abortTransaction();
                    return NextResponse.json({ error: "Blocked command detected" }, { status: 403 });
                }

                const collection = db.collection(mongoCommand.collection);
                const query = (mongoCommand.query);
                const data = (mongoCommand.data);
                const options = (mongoCommand.options);

                console.log("Executing command:", {
                    operation: mongoCommand.operation,
                    collection: mongoCommand.collection,
                    query,
                    data,
                    options
                });

                const result = await executeOperation(
                    mongoCommand.operation,
                    collection,
                    query,
                    data,
                    options,
                    db,
                    session
                );

                lastResult = result;
            }

            await session.commitTransaction();

            return NextResponse.json({ result: lastResult }, { status: 200 });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            return NextResponse.json({ error: "MongoDB transaction failed", details: error }, { status: 500 });
        }
        finally {
            session.endSession();
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Command execution failed" }, { status: 500 });
    }
}