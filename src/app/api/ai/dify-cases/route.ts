import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.DIFY_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'DIFY_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { industry, job_category, detail } = await request.json();

  const difyResponse = await fetch('https://api.dify.ai/v1/workflows/run', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: { industry, job_category, detail },
      response_mode: 'streaming',
      user: `case-finder-${Date.now()}`,
    }),
  });

  if (!difyResponse.ok) {
    const errorText = await difyResponse.text();
    console.error('Dify API error:', difyResponse.status, errorText);
    return new Response(JSON.stringify({ error: 'Dify API request failed' }), {
      status: difyResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!difyResponse.body) {
    return new Response(JSON.stringify({ error: 'No response body from Dify' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Proxy the SSE stream from Dify to the client
  const stream = new ReadableStream({
    async start(controller) {
      const reader = difyResponse.body!.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(new TextEncoder().encode(decoder.decode(value, { stream: true })));
        }
      } catch (error) {
        console.error('Stream error:', error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
