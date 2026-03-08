"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

const loginSchema = z.object({
    email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
    password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const successMessage = searchParams.get("message")

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    async function onSubmit(data: LoginFormValues) {
        setIsLoading(true)
        setError(null)

        const { error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        })

        if (authError) {
            setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
            setIsLoading(false)
            return
        }

        router.push("/dashboard")
        router.refresh()
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Giriş Yap</CardTitle>
                <CardDescription className="text-center">
                    Hesabınıza erişmek için e-posta ve şifrenizi girin.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">E-posta</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="ornek@sirket.com"
                            {...register("email")}
                            disabled={isLoading}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Şifre</Label>
                        <Input
                            id="password"
                            type="password"
                            {...register("password")}
                            disabled={isLoading}
                        />
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>

                    {successMessage && (
                        <div className="p-3 text-sm text-green-800 bg-green-100 rounded-md dark:bg-green-900/30 dark:text-green-400">
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Hesabınız yok mu?{" "}
                    <Link href="/signup" className="text-primary hover:underline">
                        Kayıt Ol
                    </Link>
                </p>
            </CardFooter>
        </Card>
    )
}

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <Suspense fallback={<div>Yükleniyor...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}
