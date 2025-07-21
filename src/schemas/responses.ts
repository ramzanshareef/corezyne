import { Type } from "@google/genai";
import { z } from "zod";

export const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            operation: { type: Type.STRING },
            collection: { type: Type.STRING },
            query: {
                type: Type.OBJECT,
                nullable: true,
                properties: { __dynamic: { type: Type.TYPE_UNSPECIFIED } }
            },
            data: {
                type: Type.OBJECT,
                nullable: true,
                properties: { __dynamic: { type: Type.TYPE_UNSPECIFIED } }
            },
            options: {
                type: Type.OBJECT,
                nullable: true,
                properties: { __dynamic: { type: Type.TYPE_UNSPECIFIED } }
            }
        },
        required: ["operation", "collection"]
    }
};