"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, LayoutList, UtensilsCrossed, ExternalLink, LogOut, Menu, Store } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"

const NAV_LINKS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/categories", label: "Kategoriler", icon: LayoutList, exact: false },
    { href: "/dashboard/menu-items", label: "Ürünler", icon: UtensilsCrossed, exact: false },
]

interface DashboardNavProps {
    restaurantName: string | null
    restaurantSlug: string | null
    children: React.ReactNode
}

export function DashboardNav({ restaurantName, restaurantSlug, children }: DashboardNavProps) {
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

    const renderNavItems = (isMobile = false) => (
        <>
            {NAV_LINKS.map(({ href, label, icon: Icon, exact }) => (
                <Link
                    key={href}
                    href={href}
                    onClick={() => isMobile && setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                        isActive(href, exact)
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                >
                    <Icon className="h-4 w-4" />
                    {label}
                </Link>
            ))}
            {restaurantSlug && (
                <a
                    href={`/menu/${restaurantSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                >
                    <ExternalLink className="h-4 w-4" />
                    Public Menü
                </a>
            )}
        </>
    )

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
            {/* ── Desktop Sidebar ── */}
            <div className="hidden border-r bg-background md:block">
                <div className="flex h-full max-h-screen flex-col gap-2 sticky top-0">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/dashboard" className="flex items-center gap-2 font-semibold truncate hover:text-primary transition-colors">
                            <Store className="h-5 w-5 shrink-0 text-primary" />
                            <span className="truncate">{restaurantName ?? "QR Menü"}</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-4">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                            {renderNavItems(false)}
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            {isLoggingOut ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Main Section ── */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* ── Mobile Header ── */}
                <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10 md:hidden">
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col w-72">
                            <SheetHeader className="text-left border-b pb-4 mb-2">
                                <SheetTitle className="flex items-center gap-2 font-semibold">
                                    <Store className="h-5 w-5 text-primary" />
                                    <span className="truncate">{restaurantName ?? "QR Menü"}</span>
                                </SheetTitle>
                                <SheetDescription className="sr-only">
                                    QR menü uygulamanızın yönetim paneli navigasyonu.
                                </SheetDescription>
                            </SheetHeader>
                            <nav className="grid gap-2 text-sm font-medium">
                                {renderNavItems(true)}
                            </nav>
                            <div className="mt-auto border-t pt-4">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    <LogOut className="h-4 w-4 shrink-0" />
                                    {isLoggingOut ? "Çıkış..." : "Çıkış Yap"}
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                    <div className="flex-1 font-semibold truncate text-sm">
                        {restaurantName ?? "QR Menü"}
                    </div>
                </header>

                {/* ── Content Area ── */}
                <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8 bg-muted/10">
                    <div className="mx-auto w-full max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
