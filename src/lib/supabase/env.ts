export function getSupabaseEnv() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url) {
        throw new Error('Eksik çevre değişkeni: NEXT_PUBLIC_SUPABASE_URL tanımlı olmalıdır.')
    }

    if (!anonKey) {
        throw new Error('Eksik çevre değişkeni: NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı olmalıdır.')
    }

    return { url, anonKey }
}
