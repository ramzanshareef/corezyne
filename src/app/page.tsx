"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
    const [name, setName] = useState('');
    const [projectNumber, setProjectNumber] = useState('');
    const [slug, setSlug] = useState('');
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(false);

    const generateSlug = () => {
        const cleanName = name.toLowerCase().replace(/\s+/g, '-');
        const cleanProject = projectNumber.toLowerCase().replace(/\s+/g, '');
        setSlug(`${cleanName}-${cleanProject}`);
    };

    const createClient = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, projectNumber, slug }),
            });

            if (res.ok) setCreated(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-[#E5E5E5] p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1DAEFF] via-[#00D2FF] to-[#FF6C1D] bg-clip-text text-transparent">
                        Corezyne
                    </h1>
                    <p className="text-[#A1AAB8]">Secure Backend-as-a-Service Platform</p>
                </header>

                <Card className="bg-[#1F2A3B] border-[#2B3A50]">
                    <CardHeader>
                        <CardTitle className="text-[#E5E5E5]">Create New Client</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!created ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 text-[#A1AAB8]">Client Name</label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            onBlur={generateSlug}
                                            className="bg-[#2B3A50] border-[#2B3A50] text-[#E5E5E5]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-[#A1AAB8]">Project Number</label>
                                        <Input
                                            value={projectNumber}
                                            onChange={(e) => setProjectNumber(e.target.value)}
                                            onBlur={generateSlug}
                                            className="bg-[#2B3A50] border-[#2B3A50] text-[#E5E5E5]"
                                        />
                                    </div>
                                </div>

                                {slug && (
                                    <div>
                                        <label className="block mb-2 text-[#A1AAB8]">Generated Slug</label>
                                        <div className="p-3 bg-[#2B3A50] rounded-md border border-[#2B3A50]">
                                            <code className="text-[#1DAEFF]">{slug}</code>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={createClient}
                                    disabled={!slug || loading}
                                    className="bg-[#1DAEFF] hover:bg-[#00D2FF] text-white"
                                >
                                    {loading ? 'Creating...' : 'Create Client'}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-2xl mb-2 text-[#00C781]">✓ Client Created!</div>
                                <p className="mb-4">Your unique slug: <span className="text-[#1DAEFF]">{slug}</span></p>
                                <Button
                                    asChild
                                    className="bg-gradient-to-r from-[#1DAEFF] to-[#00D2FF] text-white"
                                >
                                    <a href={`/do?client=${slug}`}>Go to Command Center</a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}