import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Restoran bilgisini sadece nav için çek (name + slug)
    const { data: restaurant } = await (supabase as any)
        .from("restaurants")
        .select("name, slug")
        .eq("owner_user_id", user.id)
        .maybeSingle() as { data: { name: string; slug: string } | null }

    return (
        <div className="flex min-h-screen bg-muted/10">
            <DashboardNav
                restaurantName={restaurant?.name ?? null}
                restaurantSlug={restaurant?.slug ?? null}
            />
            {/* md'de sidebar var, mobile'de yoktur; content full width */}
            <div className="flex-1 flex flex-col min-w-0">
                {children}
            </div>
        </div>
    )
}
