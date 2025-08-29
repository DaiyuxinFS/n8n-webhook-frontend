export const metadata = {
  title: 'Trigger n8n Webhook'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0 }}>
        {children}
      </body>
    </html>
  );
}

