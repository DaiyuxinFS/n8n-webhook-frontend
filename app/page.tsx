'use client';
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const method = String(form.get('method') || 'POST');
    const params = new URLSearchParams();
    form.forEach((v, k) => {
      if (k !== 'method') params.append(k, String(v));
    });
    try {
      setLoading(true);
      setResult('');
      setHtmlContent('');
      setShowPreview(false);
      
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
      // 根据返回类型分别处理
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const html = await res.text();
        setHtmlContent(html);
        setShowPreview(true);
        setResult('[HTML content received]');
        return;
      }

      const responseText = await res.text();
      setResult(responseText);
      
      // 尝试解析返回的 JSON 数据
      try {
        const jsonData = JSON.parse(responseText);
        console.log('Parsed JSON data:', jsonData);
        
        // 检查是否有 binary 数据
        if (jsonData && jsonData.binary && jsonData.binary.file && jsonData.binary.file.data) {
          console.log('Found binary data, decoding HTML...');
          // 解码 base64 HTML 内容
          const htmlData = atob(jsonData.binary.file.data);
          setHtmlContent(htmlData);
          setShowPreview(true);
        } else if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].binary) {
          console.log('Found binary data in array format...');
          // 处理数组格式的数据
          const firstItem = jsonData[0];
          if (firstItem.binary && firstItem.binary.file && firstItem.binary.file.data) {
            const htmlData = atob(firstItem.binary.file.data);
            setHtmlContent(htmlData);
            setShowPreview(true);
          }
        } else {
          console.log('No binary data found in response');
        }
      } catch (parseError) {
        // 如果不是 JSON 或没有预期的数据结构，就显示原始文本
        console.log('Response is not JSON or does not contain expected data structure:', parseError);
      }
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
            Tag: <input name="tag" placeholder="example-tag" />
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>
            Number: <input name="number" placeholder="123" />
          </label>
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? '处理中...' : '发送请求'}
        </button>
        {loading && (
          <div style={{ marginTop: 8, color: '#666', fontSize: '14px' }}>
            ⏳ 正在处理数据，请稍候...
          </div>
        )}
      </form>
      {result && result !== '[HTML content received]' && (
        <div style={{ marginTop: 16 }}>
          <h3>API 响应:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>{result}</pre>
        </div>
      )}
      
      {(showPreview && htmlContent) || (result && result.includes('<!doctype html>')) ? (
        <div style={{ marginTop: 16 }}>
          <h3>生成的内容:</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', background: 'white', maxHeight: '600px', overflow: 'auto' }}>
            {htmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: result }} />
            )}
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => {
                const content = htmlContent || result;
                const blob = new Blob([content], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'merged_content.html';
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#007aff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              下载 HTML 文件
            </button>
            <button 
              onClick={() => {
                const content = htmlContent || result;
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                  newWindow.document.write(content);
                  newWindow.document.close();
                }
              }}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#34c759', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              在新窗口打开
            </button>
            <button 
              onClick={() => {
                const content = htmlContent || result;
                navigator.clipboard.writeText(content).then(() => {
                  alert('HTML 代码已复制到剪贴板！');
                });
              }}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#ff9500', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              复制 HTML 代码
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

