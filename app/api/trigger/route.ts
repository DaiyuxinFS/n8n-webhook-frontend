import { NextRequest } from 'next/server';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://wsnb.zeabur.app/webhook-test/7e668ab2-dcdf-421a-88c5-4d2163c6450e';

function withQuery(base: string, params: URLSearchParams) {
  const u = new URL(base);
  params.forEach((v, k) => u.searchParams.set(k, v));
  return u.toString();
}

export async function GET(req: NextRequest) {
  if (!N8N_WEBHOOK_URL) return new Response('N8N_WEBHOOK_URL not set', { status: 500 });
  const url = withQuery(N8N_WEBHOOK_URL, req.nextUrl.searchParams);
  
  try {
    const res = await fetch(url, { 
      method: 'GET', 
      headers: { 
        'accept': 'application/json',
        'user-agent': 'n8n-webhook-frontend/1.0'
      }, 
      cache: 'no-store',
      signal: AbortSignal.timeout(30000) // 30秒超时
    });
    
    if (!res.ok) {
      return new Response(`n8n webhook error: ${res.status} ${res.statusText}`, { 
        status: res.status,
        headers: { 'content-type': 'text/plain' }
      });
    }
    
    const text = await res.text();
    return new Response(text, { 
      status: res.status, 
      headers: { 
        'content-type': res.headers.get('content-type') ?? 'text/plain',
        'cache-control': 'no-cache'
      } 
    });
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: { 'content-type': 'text/plain' }
    });
  }
}

export async function POST(req: NextRequest) {
  if (!N8N_WEBHOOK_URL) return new Response('N8N_WEBHOOK_URL not set', { status: 500 });
  const url = withQuery(N8N_WEBHOOK_URL, req.nextUrl.searchParams);
  const contentType = req.headers.get('content-type') || 'application/json';
  const body = await req.text();
  
  try {
    const res = await fetch(url, { 
      method: 'POST', 
      headers: { 
        'content-type': contentType, 
        'accept': 'application/json',
        'user-agent': 'n8n-webhook-frontend/1.0'
      }, 
      body,
      signal: AbortSignal.timeout(60000) // 60秒超时，因为可能需要处理大量数据
    });
    
    if (!res.ok) {
      return new Response(`n8n webhook error: ${res.status} ${res.statusText}`, { 
        status: res.status,
        headers: { 'content-type': 'text/plain' }
      });
    }
    
    const text = await res.text();
    return new Response(text, { 
      status: res.status, 
      headers: { 
        'content-type': res.headers.get('content-type') ?? 'text/plain',
        'cache-control': 'no-cache'
      } 
    });
  } catch (error) {
    console.error('Error calling n8n webhook:', error);
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: { 'content-type': 'text/plain' }
    });
  }
}


