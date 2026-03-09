import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Restaurant } from "@/types/restaurant"
import { Category, MenuItem } from "@/types/menu"
import { Badge } from "@/components/ui/badge"

// ---------------------------------------------------------------------------
// Veri çekme
// ---------------------------------------------------------------------------
async function getMenuData(slug: string) {
    const supabase = await createClient()

    // 1. Restoranı slug ile bul (sadece aktif olanı)
    const { data: restaurant } = await (supabase as any)
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle() as { data: Restaurant | null }

    if (!restaurant) return null

    // 2. Aktif kategorileri sıralı getir
    const { data: categories } = await (supabase as any)
        .from("categories")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }) as { data: Category[] | null }

    // 3. Aktif ürünleri sıralı getir
    const { data: menuItems } = await (supabase as any)
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true }) as { data: MenuItem[] | null }

    return {
        restaurant,
        categories: categories ?? [],
        menuItems: menuItems ?? [],
    }
}

// ---------------------------------------------------------------------------
// Metadata (SEO)
// ---------------------------------------------------------------------------
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const data = await getMenuData(slug)

    if (!data) {
        return {
            title: "Menü Bulunamadı",
        }
    }

    return {
        title: `${data.restaurant.name} — Dijital Menü`,
        description:
            data.restaurant.description ??
            `${data.restaurant.name} restoranının dijital menüsü.`,
    }
}

// ---------------------------------------------------------------------------
// Sayfa
// ---------------------------------------------------------------------------
export default async function MenuPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const data = await getMenuData(slug)

    if (!data) notFound()

    const { restaurant, categories, menuItems } = data

    // Kategori → ürünler haritası
    const itemsByCategory: Record<string, MenuItem[]> = {}
    for (const cat of categories) {
        itemsByCategory[cat.id] = menuItems.filter((item) => item.category_id === cat.id)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Restoran Başlığı */}
            <header
                className="px-4 py-10 text-center border-b"
                style={{ borderBottomColor: restaurant.theme_color ?? undefined }}
            >
                <h1 className="text-3xl font-bold tracking-tight">{restaurant.name}</h1>
                {restaurant.description && (
                    <p className="mt-2 text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
                        {restaurant.description}
                    </p>
                )}
                {restaurant.phone && (
                    <p className="mt-2 text-xs text-muted-foreground">📞 {restaurant.phone}</p>
                )}
                {restaurant.address && (
                    <p className="mt-1 text-xs text-muted-foreground">📍 {restaurant.address}</p>
                )}
            </header>

            {/* Menü İçeriği */}
            <main className="max-w-2xl mx-auto px-4 py-8 space-y-10">
                {categories.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg font-medium">Henüz menü eklenmemiş.</p>
                    </div>
                ) : (
                    categories.map((category) => {
                        const items = itemsByCategory[category.id] ?? []
                        if (items.length === 0) return null

                        return (
                            <section key={category.id} id={`cat-${category.id}`}>
                                {/* Kategori Başlığı */}
                                <div className="flex items-center gap-3 mb-4">
                                    <h2 className="text-xl font-bold">{category.name}</h2>
                                    <div
                                        className="flex-1 border-t"
                                        style={{ borderColor: restaurant.theme_color ?? undefined }}
                                    />
                                </div>

                                {/* Ürün Kartları */}
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <MenuItemCard
                                            key={item.id}
                                            item={item}
                                            themeColor={restaurant.theme_color}
                                        />
                                    ))}
                                </div>
                            </section>
                        )
                    })
                )}
            </main>

            {/* Footer */}
            <footer className="text-center py-8 text-xs text-muted-foreground border-t mt-4">
                <p>Bu menü dijital olarak hazırlanmıştır.</p>
            </footer>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Ürün Kartı Bileşeni
// ---------------------------------------------------------------------------
function MenuItemCard({
    item,
    themeColor,
}: {
    item: MenuItem
    themeColor: string | null
}) {
    return (
        <div className="flex gap-4 p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors">
            {/* Görsel */}
            {item.image_url && (
                <div className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        loading="lazy"
                    />
                </div>
            )}

            {/* Bilgiler */}
            <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="font-semibold text-sm leading-snug">{item.name}</span>
                        {item.is_featured && (
                            <Badge
                                className="text-[10px] px-1.5 py-0 shrink-0"
                                style={
                                    themeColor
                                        ? { backgroundColor: themeColor, color: "#fff", border: "none" }
                                        : undefined
                                }
                            >
                                ⭐ Öne Çıkan
                            </Badge>
                        )}
                    </div>
                    <span className="font-bold text-sm shrink-0 tabular-nums">
                        {Number(item.price).toFixed(2)} ₺
                    </span>
                </div>

                {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {item.description}
                    </p>
                )}
            </div>
        </div>
    )
}
