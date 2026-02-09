import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(req) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    return req.cookies.get(name)?.value
                },
                set(name, value, options) {
                    req.cookies.set({ name, value, ...options })
                    res = NextResponse.next({
                        request: { headers: req.headers },
                    })
                    res.cookies.set({ name, value, ...options })
                },
                remove(name, options) {
                    req.cookies.set({ name, value: '', ...options })
                    res = NextResponse.next({
                        request: { headers: req.headers },
                    })
                    res.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // IMPORTANT: Use getUser() instead of getSession() for security
    const { data: { user } } = await supabase.auth.getUser()

    const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
    const isAuth = req.nextUrl.pathname.startsWith('/auth')

    // 1. If trying to access dashboard but NOT logged in -> Login
    if (isDashboard && !user) {
        const url = req.nextUrl.clone()
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    // 2. If already logged in and trying to access auth pages -> Dashboard
    if (isAuth && user && !req.nextUrl.searchParams.has('message')) {
        const url = req.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return res
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*'],
}

