"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DoPage() {
    const searchParams = useSearchParams();
    const clientSlug = searchParams.get('client');
    const [command, setCommand] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(0);
    const [result, setResult] = useState<any>(null);

    const executeCommand = async () => {
        if (!command.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/do', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command, client: clientSlug }),
            });

            const data = await res.json();
            console.log(data.parsed);
            setResult(data.result);
            setStatus(res.status);
        } catch (error) {
            setResult({ error: "Command execution failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-[#E5E5E5] p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <span className="bg-gradient-to-r from-[#1DAEFF] to-[#00D2FF] bg-clip-text text-transparent">
                            Command Center
                        </span>
                        {clientSlug && (
                            <span className="text-sm bg-[#2B3A50] px-3 py-1 rounded-full">
                                {clientSlug}
                            </span>
                        )}
                    </h1>
                </header>

                <Card className="bg-[#1F2A3B] border-[#2B3A50]">
                    <CardHeader>
                        <CardTitle className="text-[#E5E5E5]">Execute Command</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div>
                                <label className="block mb-2 text-[#A1AAB8]">
                                    Natural Language Command
                                </label>
                                <Input
                                    value={command}
                                    onChange={(e) => setCommand(e.target.value)}
                                    placeholder="e.g., 'Create a new user with name John and email john@example.com'"
                                    className="bg-[#2B3A50] border-[#2B3A50] text-[#E5E5E5]"
                                />
                            </div>

                            <Button
                                onClick={executeCommand}
                                disabled={!command || loading}
                                className="bg-gradient-to-r from-[#1DAEFF] to-[#00D2FF] text-white"
                            >
                                {loading ? 'Processing...' : 'Execute'}
                            </Button>
                            <Button
                                onClick={() => setCommand('')}
                                disabled={command.trim() === '' || loading}
                                className="bg-[#2B3A50] text-[#E5E5E5] ml-2 hover:bg-[#3A4A60] disabled:cursor-not-allowed"
                            >
                                Clear
                            </Button>
                            <div>
                                {status > 0 && (
                                    <div className="mt-4">
                                        <span className={`text-sm ${status >= 200 && status < 300 ? 'text-green-500' : 'text-red-500'}`}>
                                            Status: {status}
                                        </span>
                                    </div>
                                )}
                                {result && (
                                    <div className="mt-4">
                                        <h3 className="text-xl mb-3 text-[#A1AAB8]">Result:</h3>
                                        <pre className="p-4 bg-[#0B0F1A] text-white rounded-md overflow-x-auto text-sm">
                                            {JSON.stringify(result, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}