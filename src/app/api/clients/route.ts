import { connectToDB, getClientDB } from '@/lib/db';
import Client from '@/models/Client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { name, projectNumber, slug } = await req.json();

    try {
        await connectToDB();

        // Create client in main DB
        const newClient = new Client({ name, projectNumber, slug });
        await newClient.save();

        // Create client-specific DB
        const clientDb = await getClientDB(slug);
        await clientDb.createCollection('initial');
        clientDb.close();

        return NextResponse.json({ success: true, slug }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json(
                { error: "Slug already exists" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}