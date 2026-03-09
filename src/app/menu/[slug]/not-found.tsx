import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MenuNotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <p className="text-6xl mb-4">🍽️</p>
            <h1 className="text-2xl font-bold">Menü Bulunamadı</h1>
            <p className="mt-2 text-muted-foreground max-w-xs">
                Bu adrese ait aktif bir menü bulunamadı. Lütfen linki kontrol edin.
            </p>
            <Button asChild className="mt-6">
                <Link href="/">Ana Sayfaya Dön</Link>
            </Button>
        </div>
    )
}
