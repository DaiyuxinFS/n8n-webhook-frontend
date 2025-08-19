'use client';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const method = String(form.get('method') || 'POST');
    const params = new URLSearchParams();
    for (const [k, v] of form.entries()) {
      if (k !== 'method') params.append(k, String(v));
    }
    try {
      setLoading(true);
      let res: Response;
      if (method === 'GET') {
        res = await fetch('/api/trigger?' + params.toString(), { method: 'GET' });
      } else {
        const bodyObj: Record<string, any> = {};
        params.forEach((v, k) => (bodyObj[k] = v));
        res = await fetch('/api/trigger', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(bodyObj)
        });
      }
      setResult(await res.text());
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Trigger n8n Webhook</h1>
      <form onSubmit={onSubmit}>
        <label>
          Method:
          <select name="method" defaultValue="POST" style={{ marginLeft: 8 }}>
            <option>GET</option>
            <option>POST</option>
          </select>
        </label>
        <div style={{ marginTop: 12 }}>
          <label>
            Name: <input name="name" placeholder="Alice" />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>
            Email: <input name="email" placeholder="alice@example.com" />
          </label>
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {result && (
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, marginTop: 16 }}>{result}</pre>
      )}
    </main>
  );
}

