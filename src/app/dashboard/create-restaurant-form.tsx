"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

const restaurantSchema = z.object({
    name: z.string().min(2, "Restoran adı en az 2 karakter olmalıdır."),
    slug: z.string()
        .min(2, "Kısa ad en az 2 karakter olmalıdır.")
        .regex(/^[a-z0-9-]+$/, "Kısa ad sadece küçük harf, rakam ve tire içerebilir.")
        .transform(val => val.toLowerCase()),
    description: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    theme_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir HEX renk kodu giriniz.").optional().or(z.literal('')),
})

type RestaurantFormValues = z.infer<typeof restaurantSchema>

export function CreateRestaurantForm({ userId }: { userId: string }) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<RestaurantFormValues>({
        resolver: zodResolver(restaurantSchema),
        defaultValues: {
            theme_color: "#000000",
        }
    })

    // Renk inputlarının senkron çalışması için alanımızı izliyoruz
    const themeColor = watch("theme_color")

    async function onSubmit(data: RestaurantFormValues) {
        setIsLoading(true)
        setError(null)

        const { error: insertError } = await supabase
            .from('restaurants')
            .insert({
                owner_user_id: userId,
                name: data.name,
                slug: data.slug,
                description: data.description || null,
                phone: data.phone || null,
                address: data.address || null,
                theme_color: data.theme_color || '#000000',
                is_active: true,
            })

        if (insertError) {
            if (insertError.code === '23505') {
                setError("Bu URL uzantısı (slug) başka bir restoran tarafından kullanılıyor. Lütfen farklı bir kısa ad deneyin.")
            } else {
                setError(insertError.message || "Restoran oluşturulurken bir hata meydana geldi.")
            }
            setIsLoading(false)
            return
        }

        // Başarılı kayıt sonrası dashboard sayfasını yenileyerek onboarding'i sonlandır ve özeti göster
        router.refresh()
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">İlk Restoranınızı Oluşturun</CardTitle>
                <CardDescription>
                    Sistemi kullanmaya başlamak için restoranınızın temel bilgilerini girin.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Restoran Adı *</Label>
                            <Input
                                id="name"
                                placeholder="Örn: Lezzet Dünyası"
                                {...register("name")}
                                disabled={isLoading}
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Uzantısı (Slug) *</Label>
                            <Input
                                id="slug"
                                placeholder="orn-lezzet-dunyasi"
                                {...register("slug")}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">Menünüze domain.com/menu/<strong>slug</strong> şeklinde erişilecek.</p>
                            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message as string}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Açıklama</Label>
                        <Textarea
                            id="description"
                            placeholder="Restoranınız hakkında kısa bir bilgi..."
                            {...register("description")}
                            disabled={isLoading}
                            rows={3}
                        />
                        {errors.description && <p className="text-sm text-destructive">{errors.description.message as string}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon Numarası</Label>
                            <Input
                                id="phone"
                                placeholder="+90 555 123 4567"
                                {...register("phone")}
                                disabled={isLoading}
                            />
                            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message as string}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="theme_color">Tema Rengi (HEX)</Label>
                            <div className="flex gap-2">
                                {/* Color picker form register yerine onChange/value ile text input'u güncelliyor */}
                                <Input
                                    id="themeColorPicker"
                                    type="color"
                                    className="w-12 h-10 p-1 cursor-pointer"
                                    value={themeColor}
                                    onChange={(e) => setValue("theme_color", e.target.value, { shouldValidate: true })}
                                    disabled={isLoading}
                                />
                                <Input
                                    id="theme_color"
                                    placeholder="#000000"
                                    className="flex-1"
                                    {...register("theme_color")}
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.theme_color && <p className="text-sm text-destructive">{errors.theme_color.message as string}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Adres</Label>
                        <Textarea
                            id="address"
                            placeholder="Açık adresiniz..."
                            {...register("address")}
                            disabled={isLoading}
                            rows={2}
                        />
                        {errors.address && <p className="text-sm text-destructive">{errors.address.message as string}</p>}
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md font-medium">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                            {isLoading ? "Oluşturuluyor..." : "Restoranı Kaydet"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
