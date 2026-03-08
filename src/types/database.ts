import { Restaurant } from './restaurant'
import { Category, MenuItem } from './menu'

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
                Row: Restaurant
                Insert: Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<
                    Omit<Restaurant, 'id' | 'created_at' | 'updated_at'> & {
                        id?: string
                        created_at?: string
                        updated_at?: string
                    }
                >
            }
            categories: {
                Row: Category
                Insert: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'sort_order' | 'is_active'> & {
                    id?: string
                    sort_order?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<
                    Omit<Category, 'id' | 'created_at' | 'updated_at' | 'sort_order' | 'is_active'> & {
                        id?: string
                        sort_order?: number
                        is_active?: boolean
                        created_at?: string
                        updated_at?: string
                    }
                >
            }
            menu_items: {
                Row: MenuItem
                Insert: Omit<
                    MenuItem,
                    'id' | 'created_at' | 'updated_at' | 'price' | 'is_active' | 'is_featured' | 'sort_order'
                > & {
                    id?: string
                    price?: number
                    is_active?: boolean
                    is_featured?: boolean
                    sort_order?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<
                    Omit<
                        MenuItem,
                        'id' | 'created_at' | 'updated_at' | 'price' | 'is_active' | 'is_featured' | 'sort_order'
                    > & {
                        id?: string
                        price?: number
                        is_active?: boolean
                        is_featured?: boolean
                        sort_order?: number
                        created_at?: string
                        updated_at?: string
                    }
                >
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
