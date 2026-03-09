import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateRestaurantForm } from "./create-restaurant-form"
import { RestaurantSummary } from "./restaurant-summary"

export default async function DashboardPage() {
    const supabase = await createClient()

    // Middleware zaten korumalı route'a (Dashboard) erişimi denetler.
    // Ancak getServerSession / getUser altyapısıyla datayı doğrudan burda okur.
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Kullanıcının restoranını sorgula
    let restaurant = null

    // .maybeSingle() veri bulamazsa exception / error yerine null ve data(0 record) döner,
    // Postgres 0 rows (PGRST116) hatasından kaçınmamızı sağlar.
    const { data } = await (supabase as any)
        .from("restaurants")
        .select("*")
        .eq("owner_user_id", user.id)
        .maybeSingle() as { data: import("@/types/restaurant").Restaurant | null }

    if (data) {
        restaurant = data
    }

    return (
        <main className="container mx-auto p-4 md:p-8 max-w-5xl">
            {!restaurant ? (
                <CreateRestaurantForm userId={user.id} />
            ) : (
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold tracking-tight">Hoş Geldiniz</h2>
                    <RestaurantSummary restaurant={restaurant} />
                </div>
            )}
        </main>
    )
}
