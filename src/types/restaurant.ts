export interface Restaurant {
    id: string
    owner_user_id: string
    name: string
    slug: string
    description: string | null
    logo_url: string | null
    cover_image_url: string | null
    phone: string | null
    address: string | null
    theme_color: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}
