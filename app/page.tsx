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
      const responseText = await res.text();
      setResult(responseText);
      
      // 根据返回类型分别处理
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        console.log('Received text/html directly, showing preview...');
        setHtmlContent(responseText);
        setShowPreview(true);
        return;
      }
      
      // 检查响应内容是否包含 HTML
      if (responseText.includes('<!doctype html>') || responseText.includes('<html') || responseText.includes('<body')) {
        console.log('Response contains HTML content, showing preview...');
        setHtmlContent(responseText);
        setShowPreview(true);
        return;
      }
      
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
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <main style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>Trigger n8n Webhook</h1>
      <form onSubmit={onSubmit} style={{ 
        background: '#f8f9fa', 
        padding: '24px', 
        borderRadius: '8px', 
        border: '1px solid #e9ecef',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Method:
            <select name="method" defaultValue="POST" style={{ 
              padding: '8px 12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              fontSize: '14px'
            }}>
              <option>GET</option>
              <option>POST</option>
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <label style={{ flex: 1 }}>
            <div style={{ marginBottom: '4px', fontWeight: '500' }}>Tag:</div>
            <input 
              name="tag" 
              placeholder="example-tag" 
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </label>
          <label style={{ flex: 1 }}>
            <div style={{ marginBottom: '4px', fontWeight: '500' }}>Number:</div>
            <input 
              name="number" 
              placeholder="123" 
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </label>
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007aff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {loading ? '处理中...' : '发送请求'}
        </button>
        {loading && (
          <div style={{ 
            marginTop: '12px', 
            color: '#666', 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #e3e3e3',
              borderTop: '2px solid #007aff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            正在处理数据，请稍候...
          </div>
        )}
      </form>
      {result && result !== '[HTML content received]' && (
        <div style={{ marginTop: 16 }}>
          <h3>API 响应:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 12, fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>{result}</pre>
        </div>
      )}
      
      {(showPreview && htmlContent) || (result && (result.includes('<!doctype html>') || result.includes('<html') || result.includes('<body'))) ? (
        <div style={{ marginTop: 16 }}>
          <h3>生成的内容:</h3>
          <div style={{ 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            background: 'white', 
            maxHeight: '800px', 
            overflow: 'auto',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {htmlContent ? (
              <div 
                dangerouslySetInnerHTML={{ __html: htmlContent }} 
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}
              />
            ) : (
              <div 
                dangerouslySetInnerHTML={{ __html: result }} 
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '1.6',
                  fontSize: '14px'
                }}
              />
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
    </>
  );
}

