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

    // Restoran bilgisini nav için çek
    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("name, slug")
        .eq("owner_user_id", user.id)
        .maybeSingle()

    return (
        <DashboardNav
            restaurantName={restaurant?.name ?? null}
            restaurantSlug={restaurant?.slug ?? null}
        >
            {children}
        </DashboardNav>
    )
}
