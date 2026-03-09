import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MenuItemsClient } from "./menu-items-client"
import { Category, MenuItem } from "@/types/menu"

export default async function MenuItemsPage() {
    const supabase = await createClient()

    // Auth kontrolü
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Kullanıcının restoranını bul
    const { data: restaurant } = await (supabase as any)
        .from("restaurants")
        .select("id")
        .eq("owner_user_id", user.id)
        .maybeSingle() as { data: { id: string } | null }

    // Restoran yoksa dashboard'a yönlendir (onboarding)
    if (!restaurant) redirect("/dashboard")

    // Kategorileri getir
    const { data: categories } = await (supabase as any)
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("sort_order", { ascending: true }) as { data: Category[] | null }

    // Ürünleri getir
    const { data: menuItems } = await (supabase as any)
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("sort_order", { ascending: true }) as { data: MenuItem[] | null }

    return (
        <main className="container mx-auto p-4 md:p-8 max-w-6xl">
            <MenuItemsClient
                restaurantId={restaurant.id}
                initialMenuItems={(menuItems ?? []) as MenuItem[]}
                categories={(categories ?? []) as Category[]}
            />
        </main>
    )
}
