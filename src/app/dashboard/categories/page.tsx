import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CategoriesClient } from "./categories-client"
import { Category } from "@/types/menu"

export default async function CategoriesPage() {
    const supabase = await createClient()

    // Auth kontrolü
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Kullanıcının restoranını bul
    const { data: restaurant } = await (supabase as any)
        .from("restaurants")
        .select("id")
        .eq("owner_user_id", user.id)
        .maybeSingle() as { data: { id: string } | null }

    // Restoran yoksa onboarding'e yönlendir
    if (!restaurant) redirect("/dashboard")

    // Restorana ait kategorileri getir
    const { data: categories } = await (supabase as any)
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("sort_order", { ascending: true }) as { data: Category[] | null }

    return (
        <main className="container mx-auto p-4 md:p-8 max-w-5xl">
            <CategoriesClient
                restaurantId={restaurant.id}
                initialCategories={(categories ?? []) as Category[]}
            />
        </main>
    )
}
