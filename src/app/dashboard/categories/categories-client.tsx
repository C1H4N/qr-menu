"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle, Pencil, Trash2, LayoutList } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Category } from "@/types/menu"

// ---------------------------------------------------------------------------
// Zod şeması
// ---------------------------------------------------------------------------
const categorySchema = z.object({
    name: z.string().min(1, "Kategori adı boş bırakılamaz."),
    sort_order: z.coerce.number().int().min(1, "Sıra 1 veya pozitif olmalıdır."),
})

// z.coerce kullanıldığında Zod input tipi 'unknown', output tipi 'number' olur.
// Bu yüzden iki ayrı tip tanımlıyoruz:
type CategoryFormInput = {
    name: string
    sort_order: unknown   // z.coerce.number() için Zod'un _input tipini karşılar
}

type CategoryFormValues = {
    name: string
    sort_order: number    // Zod coerce sonrası dönüştürülen çıktı
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface CategoriesClientProps {
    restaurantId: string
    initialCategories: Category[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function CategoriesClient({ restaurantId, initialCategories }: CategoriesClientProps) {
    const router = useRouter()
    const supabase = createClient()

    const [categories, setCategories] = useState<Category[]>(initialCategories)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
        resolver: zodResolver(categorySchema),
    })

    // Dialog aç: yeni ekleme
    function openCreateDialog() {
        setEditingCategory(null)
        const nextSortOrder = categories.length > 0
            ? Math.max(...categories.map(c => c.sort_order)) + 1
            : 1
        reset({ name: "", sort_order: nextSortOrder })
        setError(null)
        setDialogOpen(true)
    }

    // Dialog aç: düzenleme
    function openEditDialog(category: Category) {
        setEditingCategory(category)
        reset({ name: category.name, sort_order: category.sort_order })
        setError(null)
        setDialogOpen(true)
    }

    function closeDialog() {
        setDialogOpen(false)
        setEditingCategory(null)
        setError(null)
    }

    // Kaydet (ekle veya güncelle)
    const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
        setIsLoading(true)
        setError(null)

        const isSortOrderTaken = categories.some(
            (c) => c.sort_order === data.sort_order && c.id !== editingCategory?.id
        )

        if (isSortOrderTaken) {
            setError("Bu sıra numarası başka bir kategori tarafından kullanılıyor.")
            setIsLoading(false)
            return
        }

        if (editingCategory) {
            // Güncelle
            const { data: updated, error: updateError } = await supabase
                .from("categories")
                .update({ name: data.name, sort_order: data.sort_order })
                .eq("id", editingCategory.id)
                .select()
                .single()

            if (updateError) {
                if (updateError.code === "23505") {
                    setError(updateError.message.includes("sort_order")
                        ? "Bu sıra numarası başka bir kategori tarafından kullanılıyor."
                        : "Bu isimde bir kategori zaten mevcut.")
                } else {
                    setError(updateError.message)
                }
                setIsLoading(false)
                return
            }

            setCategories(prev =>
                prev.map(c => c.id === editingCategory.id ? updated! : c)
            )
        } else {
            // Ekle
            const { data: inserted, error: insertError } = await supabase
                .from("categories")
                .insert({
                    restaurant_id: restaurantId,
                    name: data.name,
                    sort_order: data.sort_order,
                    is_active: true,
                })
                .select()
                .single()

            if (insertError) {
                if (insertError.code === "23505") {
                    setError(insertError.message.includes("sort_order")
                        ? "Bu sıra numarası başka bir kategori tarafından kullanılıyor."
                        : "Bu isimde bir kategori zaten mevcut.")
                } else {
                    setError(insertError.message)
                }
                setIsLoading(false)
                return
            }

            setCategories(prev => [...prev, inserted!])
        }

        closeDialog()
        setIsLoading(false)
        router.refresh()
    }

    // Aktif/Pasif toggle
    async function handleToggleActive(category: Category) {
        const newVal = !category.is_active

        const { error: toggleError } = await supabase
            .from("categories")
            .update({ is_active: newVal })
            .eq("id", category.id)

        if (toggleError) return

        setCategories(prev =>
            prev.map(c => c.id === category.id ? { ...c, is_active: newVal } : c)
        )
        router.refresh()
    }

    // Silme onayı iste
    function confirmDelete(category: Category) {
        setDeleteTarget(category)
    }

    // Silme işlemini gerçekleştir
    async function handleDelete() {
        if (!deleteTarget) return
        setDeletingId(deleteTarget.id)

        const { error: deleteError } = await supabase
            .from("categories")
            .delete()
            .eq("id", deleteTarget.id)

        if (!deleteError) {
            setCategories(prev => prev.filter(c => c.id !== deleteTarget.id))
            router.refresh()
        }

        setDeletingId(null)
        setDeleteTarget(null)
    }

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <div className="space-y-6">
            {/* Üst Bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Kategoriler</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Menünüzdeki kategori gruplarını yönetin.
                    </p>
                </div>
                <Button onClick={openCreateDialog}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Yeni Kategori
                </Button>
            </div>

            {/* İçerik */}
            {categories.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/20">
                    <LayoutList className="h-10 w-10 text-muted-foreground mb-3" />
                    <h3 className="font-semibold text-lg">Henüz kategori yok</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                        Menünüzü organize etmek için ilk kategorinizi ekleyin.
                    </p>
                    <Button className="mt-4" onClick={openCreateDialog}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        İlk Kategoriyi Ekle
                    </Button>
                </div>
            ) : (
                // Tablo
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead>Kategori Adı</TableHead>
                                <TableHead className="w-28 text-center">Durum</TableHead>
                                <TableHead className="w-28 text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...categories]
                                .sort((a, b) => a.sort_order - b.sort_order)
                                .map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {category.sort_order}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {category.name}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Switch
                                                    checked={category.is_active}
                                                    onCheckedChange={() => handleToggleActive(category)}
                                                    id={`toggle-${category.id}`}
                                                />
                                                <Badge
                                                    variant={category.is_active ? "default" : "secondary"}
                                                    className="text-xs"
                                                >
                                                    {category.is_active ? "Aktif" : "Pasif"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => openEditDialog(category)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => confirmDelete(category)}
                                                    disabled={deletingId === category.id}
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
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="cat-name">Kategori Adı *</Label>
                            <Input
                                id="cat-name"
                                placeholder="Örn: Ana Yemekler"
                                {...register("name")}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cat-sort">Sıra No</Label>
                            <Input
                                id="cat-sort"
                                type="number"
                                min={1}
                                {...register("sort_order", { valueAsNumber: true })}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Küçük numara menüde önce görünür.
                            </p>
                            {errors.sort_order && (
                                <p className="text-sm text-destructive">{errors.sort_order.message}</p>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">
                                {error}
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={closeDialog} disabled={isLoading}>
                                İptal
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? "Kaydediliyor..."
                                    : editingCategory
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
                        <AlertDialogTitle>Kategoriyi silmek istediğinize emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            <strong>&ldquo;{deleteTarget?.name}&rdquo;</strong> kategorisi kalıcı olarak silinecektir.
                            Bu kategoriye bağlı ürünler de etkilenebilir. Bu işlem geri alınamaz.
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
