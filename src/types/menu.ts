export interface Category {
    id: string
    restaurant_id: string
    name: string
    sort_order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface MenuItem {
    id: string
    restaurant_id: string
    category_id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    is_active: boolean
    is_featured: boolean
    sort_order: number
    created_at: string
    updated_at: string
}

export interface CategoryWithItems extends Category {
    menu_items: MenuItem[]
}
