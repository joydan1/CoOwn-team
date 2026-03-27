import { NextResponse } from 'next/server'

export async function GET() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "https://coown-team.onrender.com"
  
  try {
    // Fetch from backend through server (no CORS issues)
    const response = await fetch(`${apiBase}/auth/google`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    // Return the data to the client
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500 }
    )
  }
}