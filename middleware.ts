// 简单的中间件用于重定向未登录用户
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 如果是登录页面或API路由，允许访问
  if (request.nextUrl.pathname.startsWith('/auth') ||
      request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // 这里无法检查localStorage（服务端），所以让前端处理
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了静态文件
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ]
}
