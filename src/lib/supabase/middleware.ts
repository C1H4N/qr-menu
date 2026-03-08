import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseEnv } from './env'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Middleware çalıştığında çevre değişkeni yoksa (örn: build time), atla
    try {
        const { url, anonKey } = getSupabaseEnv()

        const supabase = createServerClient(
            url,
            anonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Auth durumunu kontrol et (getUser ile veritabanından session'u doğrula)
        const { data: { user } } = await supabase.auth.getUser()

        // 1. Durum: Kullanıcı giriş YAPMAMIŞ ve `/dashboard` gibi korumalı bir sayfaya girmeye çalışıyor.
        // Dashboard ve altındaki tüm routelar korumalıdır.
        if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
            const loginUrl = request.nextUrl.clone()
            loginUrl.pathname = '/login'
            return NextResponse.redirect(loginUrl)
        }

        // 2. Durum: Kullanıcı giriş YAPMIŞ ve `/login` veya `/signup` sayfasına girmeye çalışıyor.
        // Direkt dashboard'a atalım.
        if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
            const dashboardUrl = request.nextUrl.clone()
            dashboardUrl.pathname = '/dashboard'
            return NextResponse.redirect(dashboardUrl)
        }

        return supabaseResponse
    } catch (error) {
        // Env bulunamadı gibi kritik hatalarda Next Response çalışmaya devam etsin
        return supabaseResponse
    }
}
