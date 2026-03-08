import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ message: 'Выход выполнен' })
  res.cookies.delete('sb-access-token')
  res.cookies.delete('supabase-auth-token')
  res.cookies.delete('user-role')
  res.cookies.delete('user-name')
  return res
}
