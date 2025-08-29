'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [username, setUsername] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [hasContent, setHasContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 检查登录状态
    const loggedIn = localStorage.getItem('isLoggedIn');
    const storedUsername = localStorage.getItem('username');

    if (!loggedIn || loggedIn !== 'true') {
      router.push('/auth/signin');
      return;
    }

    setIsLoggedIn(true);
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [router]);

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
      setHasContent(false);
      
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
        console.log('Received text/html directly');
        setHtmlContent(responseText);
        setHasContent(true);
        return;
      }
      
      // 检查响应内容是否包含 HTML
      if (responseText.includes('<!doctype html>') || responseText.includes('<html') || responseText.includes('<body')) {
        console.log('Response contains HTML content');
        setHtmlContent(responseText);
        setHasContent(true);
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
          setHasContent(true);
        } else if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].binary) {
          console.log('Found binary data in array format...');
          // 处理数组格式的数据
          const firstItem = jsonData[0];
          if (firstItem.binary && firstItem.binary.file && firstItem.binary.file.data) {
            const htmlData = atob(firstItem.binary.file.data);
            setHtmlContent(htmlData);
            setHasContent(true);
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

  // 处理下载HTML文件
  const handleDownload = () => {
    if (!htmlContent && !result) return;
    const content = htmlContent || result;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'merged_content.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 处理在新窗口打开
  const handleOpenInNewWindow = () => {
    if (!htmlContent && !result) return;
    const content = htmlContent || result;
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.close();
    }
  };

  // 处理复制HTML代码
  const handleCopyCode = () => {
    if (!htmlContent && !result) return;
    const content = htmlContent || result;
    navigator.clipboard.writeText(content).then(() => {
      alert('HTML 代码已复制到剪贴板！');
    }).catch(() => {
      alert('复制失败，请手动复制');
    });
  };

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <main style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>Trigger n8n Webhook</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>
              欢迎, {username}
            </span>
            <button
              onClick={() => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                router.push('/auth/signin');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff3b30',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              退出登录
            </button>
          </div>
        </div>
        
        {/* 表单区域 */}
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

        {/* API响应信息 */}
        {result && result !== '[HTML content received]' && !hasContent && (
          <div style={{ marginTop: 16 }}>
            <h3>API 响应:</h3>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              background: '#f5f5f5', 
              padding: 12, 
              fontSize: '12px', 
              maxHeight: '200px', 
              overflow: 'auto',
              borderRadius: '4px'
            }}>
              {result}
            </pre>
          </div>
        )}

        {/* 成功提示和操作按钮区域 */}
        {hasContent && (
          <div style={{ 
            background: '#e8f5e8', 
            border: '1px solid #4caf50', 
            borderRadius: '8px', 
            padding: '20px', 
            marginTop: '16px' 
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#2e7d32' }}>✅ 生成成功！</h3>
            <p style={{ margin: '0 0 20px 0', color: '#388e3c' }}>
              内容已成功生成，请选择下方操作：
            </p>
            
            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleDownload}
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#007aff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📥 下载 HTML 文件
              </button>
              <button 
                onClick={handleOpenInNewWindow}
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#34c759', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔗 在新窗口打开
              </button>
              <button 
                onClick={handleCopyCode}
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#ff9500', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                📋 复制 HTML 代码
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

