"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle, Pencil, Trash2, UtensilsCrossed, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"
import { Category, MenuItem } from "@/types/menu"

// ---------------------------------------------------------------------------
// Zod Şeması
// ---------------------------------------------------------------------------
const menuItemSchema = z.object({
    name: z.string().min(1, "Ürün adı boş bırakılamaz."),
    description: z.string().optional(),
    price: z.coerce
        .number()
        .min(0, "Fiyat 0 veya daha yüksek olmalıdır."),
    image_url: z.string().url("Geçerli bir URL girin.").optional().or(z.literal("")),
    category_id: z.string().min(1, "Kategori seçimi zorunludur."),
    sort_order: z.coerce.number().int().min(1, "Sıra 1 veya pozitif olmalıdır."),
    is_active: z.boolean(),
    is_featured: z.boolean(),
})

// İki tip: input (HTML'den gelen ham), output (Zod dönüşümü sonrası)
type MenuItemFormInput = {
    name: string
    description?: string
    price: unknown          // z.coerce için
    image_url?: string
    category_id: string
    sort_order: unknown     // z.coerce için
    is_active: boolean
    is_featured: boolean
}

type MenuItemFormValues = z.infer<typeof menuItemSchema>

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface MenuItemsClientProps {
    restaurantId: string
    initialMenuItems: MenuItem[]
    categories: Category[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function MenuItemsClient({
    restaurantId,
    initialMenuItems,
    categories,
}: MenuItemsClientProps) {
    const router = useRouter()
    const supabase = createClient()

    const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MenuItemFormInput, unknown, MenuItemFormValues>({
        resolver: zodResolver(menuItemSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            image_url: "",
            category_id: categories[0]?.id ?? "",
            sort_order: 1,
            is_active: true,
            is_featured: false,
        },
    })

    const isActiveVal = watch("is_active")
    const isFeaturedVal = watch("is_featured")
    const categoryIdVal = watch("category_id")


    // Kategoriye göre yeni sort_order değerini hesapla
    const getNextSortOrder = useCallback((categoryId: string) => {
        const categoryItems = menuItems.filter((i) => i.category_id === categoryId)
        if (categoryItems.length === 0) return 1
        return Math.max(...categoryItems.map((i) => i.sort_order)) + 1
    }, [menuItems])

    // Seçili kategori değiştiğinde eğer "Yeni Kayıt" modundaysak sort_order değerini güncelle
    useEffect(() => {
        if (dialogOpen && !editingItem && categoryIdVal) {
            setValue("sort_order", getNextSortOrder(categoryIdVal), { shouldValidate: true })
        }
    }, [categoryIdVal, dialogOpen, editingItem, setValue, getNextSortOrder])

    // Dialog aç: yeni ürün
    function openCreateDialog() {
        setEditingItem(null)
        const defaultCategory = categories[0]?.id ?? ""
        reset({
            name: "",
            description: "",
            price: 0,
            image_url: "",
            category_id: defaultCategory,
            sort_order: defaultCategory ? getNextSortOrder(defaultCategory) : 1,
            is_active: true,
            is_featured: false,
        })
        setError(null)
        setDialogOpen(true)
    }

    // Dialog aç: düzenleme
    function openEditDialog(item: MenuItem) {
        setEditingItem(item)
        reset({
            name: item.name,
            description: item.description ?? "",
            price: item.price,
            image_url: item.image_url ?? "",
            category_id: item.category_id,
            sort_order: item.sort_order,
            is_active: item.is_active,
            is_featured: item.is_featured,
        })
        setError(null)
        setDialogOpen(true)
    }

    function closeDialog() {
        setDialogOpen(false)
        setEditingItem(null)
        setError(null)
        reset({
            name: "",
            description: "",
            price: 0,
            image_url: "",
            category_id: categories[0]?.id ?? "",
            sort_order: 1,
            is_active: true,
            is_featured: false,
        })
    }

    // Kaydet
    const onSubmit: SubmitHandler<MenuItemFormValues> = async (data) => {
        setIsLoading(true)
        setError(null)

        const payload = {
            restaurant_id: restaurantId,
            category_id: data.category_id,
            name: data.name,
            description: data.description || null,
            price: data.price,
            image_url: data.image_url || null,
            is_active: data.is_active,
            is_featured: data.is_featured,
            sort_order: data.sort_order,
        }

        const isSortOrderTaken = menuItems.some(
            (i) => i.category_id === data.category_id && i.sort_order === data.sort_order && i.id !== editingItem?.id
        )

        if (isSortOrderTaken) {
            setError("Bu kategori içinde bu sıra numarası kullanımda.")
            setIsLoading(false)
            return
        }

        if (editingItem) {
            const { data: updated, error: updateError } = await supabase
                .from("menu_items")
                .update(payload)
                .eq("id", editingItem.id)
                .select()
                .single()

            if (updateError) {
                if (updateError.code === "23505") {
                    setError(updateError.message.includes("sort_order")
                        ? "Bu kategori içinde bu sıra numarası kullanımda."
                        : "Aynı isimde başka bir ürün bulunuyor.")
                } else {
                    setError(updateError.message)
                }
                setIsLoading(false)
                return
            }
            setMenuItems((prev) =>
                prev.map((i) => (i.id === editingItem.id ? updated! : i))
            )
        } else {
            const { data: inserted, error: insertError } = await supabase
                .from("menu_items")
                .insert(payload)
                .select()
                .single()

            if (insertError) {
                if (insertError.code === "23505") {
                    setError(insertError.message.includes("sort_order")
                        ? "Bu kategori içinde bu sıra numarası kullanımda."
                        : "Aynı isimde başka bir ürün bulunuyor.")
                } else {
                    setError(insertError.message)
                }
                setIsLoading(false)
                return
            }
            setMenuItems((prev) => [...prev, inserted!])
        }

        closeDialog()
        setIsLoading(false)
        router.refresh()
    }

    // Aktif/Pasif toggle
    async function handleToggleActive(item: MenuItem) {
        const newVal = !item.is_active
        const { error: toggleError } = await supabase
            .from("menu_items")
            .update({ is_active: newVal })
            .eq("id", item.id)
        if (toggleError) return
        setMenuItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, is_active: newVal } : i))
        )
        router.refresh()
    }

    // Featured toggle
    async function handleToggleFeatured(item: MenuItem) {
        const newVal = !item.is_featured
        const { error: featuredError } = await supabase
            .from("menu_items")
            .update({ is_featured: newVal })
            .eq("id", item.id)
        if (featuredError) return
        setMenuItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, is_featured: newVal } : i))
        )
        router.refresh()
    }

    // Silme onayı iste
    function confirmDelete(item: MenuItem) {
        setDeleteTarget(item)
    }

    // Silme işlemini gerçekleştir
    async function handleDelete() {
        if (!deleteTarget) return
        setDeletingId(deleteTarget.id)
        const { error: deleteError } = await supabase
            .from("menu_items")
            .delete()
            .eq("id", deleteTarget.id)
        if (!deleteError) {
            setMenuItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
            router.refresh()
        }
        setDeletingId(null)
        setDeleteTarget(null)
    }

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    const groupedItems = categories
        .map((category) => {
            const items = menuItems.filter((i) => i.category_id === category.id)
            return {
                ...category,
                items: items.sort((a, b) => a.sort_order - b.sort_order),
            }
        })
        .filter((group) => group.items.length > 0)
        .sort((a, b) => a.sort_order - b.sort_order)

    // Boş kategori durumu
    if (categories.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Ürünler</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Menünüzdeki ürünleri yönetin.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20">
                    <UtensilsCrossed className="h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-lg">Önce kategori ekleyin</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        Ürün eklemek için en az bir kategoriye ihtiyacınız var.
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/categories">Kategorilere Git</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Üst Bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Ürünler</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Menünüzdeki ürünleri yönetin.
                    </p>
                </div>
                <Button onClick={openCreateDialog}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Yeni Ürün
                </Button>
            </div>

            {/* İçerik */}
            {menuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20">
                    <UtensilsCrossed className="h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-lg">Henüz ürün yok</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        Menünüze ilk ürünü ekleyin.
                    </p>
                    <Button className="mt-4" onClick={openCreateDialog}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        İlk Ürünü Ekle
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    {groupedItems.map((group) => (
                        <div key={group.id} className="space-y-3">
                            <div className="flex items-center gap-2 px-1">
                                <h3 className="text-lg font-semibold">{group.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                    {group.items.length} Ürün
                                </Badge>
                            </div>
                            <div className="rounded-md border bg-card">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10">#</TableHead>
                                            <TableHead>Ürün Adı</TableHead>
                                            <TableHead className="w-24 text-right">Fiyat</TableHead>
                                            <TableHead className="w-24 text-center">Aktif</TableHead>
                                            <TableHead className="w-24 text-center">Öne Çıkan</TableHead>
                                            <TableHead className="w-24 text-right">İşlemler</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {group.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {item.sort_order}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        {item.description && (
                                                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {Number(item.price).toFixed(2)} ₺
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Switch
                                                        checked={item.is_active}
                                                        onCheckedChange={() => handleToggleActive(item)}
                                                        id={`active-${item.id}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Switch
                                                        checked={item.is_featured}
                                                        onCheckedChange={() => handleToggleFeatured(item)}
                                                        id={`featured-${item.id}`}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => openEditDialog(item)}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => confirmDelete(item)}
                                                            disabled={deletingId === item.id}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        {/* Ad */}
                        <div className="space-y-2">
                            <Label htmlFor="item-name">Ürün Adı *</Label>
                            <Input
                                id="item-name"
                                placeholder="Örn: Margherita Pizza"
                                {...register("name")}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Açıklama */}
                        <div className="space-y-2">
                            <Label htmlFor="item-desc">Açıklama</Label>
                            <Textarea
                                id="item-desc"
                                placeholder="Ürün hakkında kısa bilgi..."
                                rows={2}
                                {...register("description")}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Fiyat */}
                            <div className="space-y-2">
                                <Label htmlFor="item-price">Fiyat (₺) *</Label>
                                <Input
                                    id="item-price"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="0.00"
                                    {...register("price", { valueAsNumber: true })}
                                    disabled={isLoading}
                                />
                                {errors.price && (
                                    <p className="text-sm text-destructive">{errors.price.message}</p>
                                )}
                            </div>

                            {/* Sıra */}
                            <div className="space-y-2">
                                <Label htmlFor="item-sort">Kategori İçi Sıra</Label>
                                <Input
                                    id="item-sort"
                                    type="number"
                                    min={1}
                                    {...register("sort_order", { valueAsNumber: true })}
                                    disabled={isLoading}
                                />
                                {errors.sort_order && (
                                    <p className="text-sm text-destructive">{errors.sort_order.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Kategori */}
                        <div className="space-y-2">
                            <Label htmlFor="item-category">Kategori *</Label>
                            <Select
                                value={categoryIdVal}
                                onValueChange={(val) =>
                                    setValue("category_id", val, { shouldValidate: true })
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger id="item-category">
                                    <SelectValue placeholder="Kategori seçin..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && (
                                <p className="text-sm text-destructive">{errors.category_id.message}</p>
                            )}
                        </div>

                        {/* Görsel URL */}
                        <div className="space-y-2">
                            <Label htmlFor="item-image">Görsel URL</Label>
                            <Input
                                id="item-image"
                                type="url"
                                placeholder="https://..."
                                {...register("image_url")}
                                disabled={isLoading}
                            />
                            {errors.image_url && (
                                <p className="text-sm text-destructive">{errors.image_url.message}</p>
                            )}
                        </div>

                        {/* Togglelar */}
                        <div className="flex items-center gap-6 pt-1">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="item-active"
                                    checked={!!isActiveVal}
                                    onCheckedChange={(val) =>
                                        setValue("is_active", val, { shouldValidate: true })
                                    }
                                    disabled={isLoading}
                                />
                                <Label htmlFor="item-active" className="cursor-pointer">Aktif</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="item-featured"
                                    checked={!!isFeaturedVal}
                                    onCheckedChange={(val) =>
                                        setValue("is_featured", val, { shouldValidate: true })
                                    }
                                    disabled={isLoading}
                                />
                                <Label htmlFor="item-featured" className="cursor-pointer flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5" />
                                    Öne Çıkan
                                </Label>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">
                                {error}
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDialog}
                                disabled={isLoading}
                            >
                                İptal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? "Kaydediliyor..."
                                    : editingItem
                                        ? "Güncelle"
                                        : "Ekle"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Silme Onay Diyaloğu */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ürünü silmek istediğinize emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong> ürünü kalıcı olarak silinecektir.
                            Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={!!deletingId}>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={!!deletingId}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deletingId ? "Siliniyor..." : "Evet, Sil"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
