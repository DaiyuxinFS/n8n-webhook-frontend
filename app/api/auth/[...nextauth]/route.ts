// 这是一个简单的密码验证方式
// 你也可以直接在这里设置固定密码（不推荐用于生产环境）

const VALID_USERNAME = process.env.AUTH_USERNAME || "admin"
const VALID_PASSWORD = process.env.AUTH_PASSWORD

if (!VALID_PASSWORD) {
  throw new Error("AUTH_PASSWORD environment variable is not set")
}

export async function GET() {
  return new Response('Auth endpoint', { status: 200 })
}

export async function POST(request: Request) {
  const { username, password } = await request.json()

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    return new Response(JSON.stringify({
      success: true,
      user: { name: username }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({
    success: false,
    error: '用户名或密码错误'
  }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  })
}
