import type { Database } from './database'

export type Category = Database['public']['Tables']['categories']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']

export interface CategoryWithItems extends Category {
    menu_items: MenuItem[]
}
