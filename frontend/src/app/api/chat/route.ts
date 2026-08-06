import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, subject } = body;

        // 2. Input Validation
        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message must be a non-empty string' }, { status: 400 });
        }

        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Pass auth token if available (assuming cookie or auth header might be needed eventually, though backend might not strictly require it for this chat route if claims are ignored or checked)
                // For now, we'll just pass the body.
                ...(req.headers.get('cookie') ? { 'cookie': req.headers.get('cookie') as string } : {}),
                ...(req.headers.get('authorization') ? { 'authorization': req.headers.get('authorization') as string } : {})
            },
            body: JSON.stringify({
                message: message.trim(),
                subject: subject
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend API Error Response:', errorText);
            throw new Error(`Backend API Error (${response.status})`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch response from backend AI provider',
            details: error.message
        }, { status: 500 });
    }
}
