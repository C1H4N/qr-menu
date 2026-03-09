import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Restaurant } from "@/types/restaurant"
import { MapPin, Phone, Link as LinkIcon, Palette } from "lucide-react"

export function RestaurantSummary({ restaurant }: { restaurant: Restaurant }) {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl">{restaurant.name}</CardTitle>
                        <CardDescription className="max-w-xl">
                            {restaurant.description || "Açıklama belirtilmemiş."}
                        </CardDescription>
                    </div>
                    <Badge variant={restaurant.is_active ? "default" : "destructive"} className="text-xs shrink-0">
                        {restaurant.is_active ? "Aktif Durumda" : "Pasif Durumda"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex flex-col">
                                <span className="font-medium">QR Menü Linki:</span>
                                <span className="text-muted-foreground break-all">/menu/{restaurant.slug}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex flex-col">
                                <span className="font-medium">İletişim Numarası:</span>
                                <span className="text-muted-foreground">{restaurant.phone || "Belirtilmedi"}</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                                <span className="font-medium">Fiziksel Adres:</span>
                                <span className="text-muted-foreground">{restaurant.address || "Belirtilmedi"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Palette className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex flex-col">
                                <span className="font-medium">Tema Rengi:</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div
                                        className="h-5 w-5 rounded-full border shadow-sm"
                                        style={{ backgroundColor: restaurant.theme_color || '#000000' }}
                                    />
                                    <span className="text-muted-foreground uppercase">{restaurant.theme_color || '#000000'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg text-sm flex gap-2">
                            <span className="font-medium">Kayıt Tarihi:</span>
                            <span className="text-muted-foreground">
                                {new Date(restaurant.created_at).toLocaleDateString("tr-TR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
