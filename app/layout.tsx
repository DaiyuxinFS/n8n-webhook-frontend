export const metadata = {
  title: '外网社媒热点爬虫'
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

