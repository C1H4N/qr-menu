"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, LayoutList, UtensilsCrossed, ExternalLink, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const NAV_LINKS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/categories", label: "Kategoriler", icon: LayoutList, exact: false },
    { href: "/dashboard/menu-items", label: "Ürünler", icon: UtensilsCrossed, exact: false },
]

interface DashboardNavProps {
    restaurantName: string | null
    restaurantSlug: string | null
}

export function DashboardNav({ restaurantName, restaurantSlug }: DashboardNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    function isActive(href: string, exact: boolean) {
        return exact ? pathname === href : pathname.startsWith(href)
    }

    async function handleLogout() {
        setIsLoggingOut(true)
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <>
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden md:flex flex-col w-60 shrink-0 border-r bg-background min-h-screen sticky top-0 h-screen">
                {/* Logo / Başlık */}
                <div className="h-14 flex items-center px-4 border-b">
                    <span className="font-bold text-primary text-base truncate">
                        {restaurantName ?? "QR Menü"}
                    </span>
                </div>

                {/* Navigasyon */}
                <nav className="flex-1 py-4 px-3 space-y-1">
                    {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(href, exact)
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                        </Link>
                    ))}

                    {/* Public Menü Linki */}
                    {restaurantSlug && (
                        <a
                            href={`/menu/${restaurantSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            <ExternalLink className="h-4 w-4 shrink-0" />
                            Public Menü
                        </a>
                    )}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
                    </Button>
                </div>
            </aside>

            {/* ── Mobile Top Bar ── */}
            <header className="md:hidden sticky top-0 z-20 bg-background border-b h-14 flex items-center justify-between px-4">
                <span className="font-bold text-primary text-sm truncate max-w-[200px]">
                    {restaurantName ?? "QR Menü"}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label="Menüyü aç/kapat"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </header>

            {/* ── Mobile Drawer ── */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-10 bg-black/40" onClick={() => setMobileOpen(false)}>
                    <nav
                        className="absolute top-14 left-0 right-0 bg-background border-b shadow-lg p-4 space-y-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive(href, exact)
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    }`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {label}
                            </Link>
                        ))}

                        {restaurantSlug && (
                            <a
                                href={`/menu/${restaurantSlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            >
                                <ExternalLink className="h-4 w-4 shrink-0" />
                                Public Menü
                            </a>
                        )}

                        <div className="pt-2 border-t mt-2">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                <LogOut className="h-4 w-4 shrink-0" />
                                {isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </>
    )
}
