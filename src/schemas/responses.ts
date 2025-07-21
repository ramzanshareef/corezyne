import { Type } from "@google/genai";

export const responseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        required: ["operation", "collection"],
        propertyOrdering: ["operation", "collection", "query", "data", "options", "pipeline"],
        properties: {
            operation: {
                type: Type.STRING,
                format: "enum",
                enum: [
                    "find", "findone", "insert", "insertone", "insertmany",
                    "update", "updateone", "updatemany",
                    "delete", "deleteone", "deletemany",
                    "count", "countdocuments", "distinct", "aggregate",
                    "register", "login"
                ]
            },
            collection: {
                type: Type.STRING
            },
            query: {
                type: Type.OBJECT,
                nullable: true,
                minProperties: "0",
                properties: {}
            },
            data: {
                type: Type.OBJECT,
                nullable: true,
                minProperties: "0",
                properties: {}
            },
            options: {
                type: Type.OBJECT,
                nullable: true,
                minProperties: "0",
                properties: {}
            },
            pipeline: {
                type: Type.ARRAY,
                nullable: true,
                minItems: "0",
                items: {
                    type: Type.OBJECT,
                    properties: {},
                    minProperties: "0"
                }
            }
        }
    }
};
