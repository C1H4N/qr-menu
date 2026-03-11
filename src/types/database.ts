export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            restaurants: {
                Row: {
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
                Insert: {
                    id?: string
                    owner_user_id: string
                    name: string
                    slug: string
                    description?: string | null
                    logo_url?: string | null
                    cover_image_url?: string | null
                    phone?: string | null
                    address?: string | null
                    theme_color?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    owner_user_id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    logo_url?: string | null
                    cover_image_url?: string | null
                    phone?: string | null
                    address?: string | null
                    theme_color?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            categories: {
                Row: {
                    id: string
                    restaurant_id: string
                    name: string
                    sort_order: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    restaurant_id: string
                    name: string
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    restaurant_id?: string
                    name?: string
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "categories_restaurant_id_fkey"
                        columns: ["restaurant_id"]
                        isOneToOne: false
                        referencedRelation: "restaurants"
                        referencedColumns: ["id"]
                    }
                ]
            }
            menu_items: {
                Row: {
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
                Insert: {
                    id?: string
                    restaurant_id: string
                    category_id: string
                    name: string
                    description?: string | null
                    price?: number
                    image_url?: string | null
                    is_active?: boolean
                    is_featured?: boolean
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    restaurant_id?: string
                    category_id?: string
                    name?: string
                    description?: string | null
                    price?: number
                    image_url?: string | null
                    is_active?: boolean
                    is_featured?: boolean
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "menu_items_restaurant_id_fkey"
                        columns: ["restaurant_id"]
                        isOneToOne: false
                        referencedRelation: "restaurants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "menu_items_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
