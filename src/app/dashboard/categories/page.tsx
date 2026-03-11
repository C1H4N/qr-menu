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
    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_user_id", user.id)
        .maybeSingle()

    // Restoran yoksa onboarding'e yönlendir
    if (!restaurant) redirect("/dashboard")

    // Restorana ait kategorileri getir
    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("sort_order", { ascending: true })

    return (
        <CategoriesClient
            restaurantId={restaurant.id}
            initialCategories={(categories ?? []) as Category[]}
        />
    )
}
