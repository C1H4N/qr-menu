import { createClient } from "@/lib/supabase/server"
import { CreateRestaurantForm } from "./create-restaurant-form"
import { RestaurantSummary } from "./restaurant-summary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutList, UtensilsCrossed } from "lucide-react"

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const userId = user!.id

    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_user_id", userId)
        .maybeSingle()

    if (!restaurant) {
        return <CreateRestaurantForm userId={userId} />
    }

    // Basit istatistikler için sayıları çekiyoruz
    const [{ count: catCount }, { count: itemCount }] = await Promise.all([
        supabase.from("categories").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id),
        supabase.from("menu_items").select("*", { count: "exact", head: true }).eq("restaurant_id", restaurant.id),
    ])

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Hoş Geldiniz</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Kategori</CardTitle>
                        <LayoutList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{catCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Menünüzdeki kategori sayısı
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
                        <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{itemCount || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tüm kategorilerdeki ürünler
                        </p>
                    </CardContent>
                </Card>
            </div>

            <RestaurantSummary restaurant={restaurant} />
        </div>
    )
}
