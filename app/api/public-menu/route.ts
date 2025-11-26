import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET() {
    try {
        const supabase = createSupabaseClient()

        // Call the bulk fetch RPC
        const { data, error } = await supabase
            .rpc('get_full_menu_allergens')

        if (error) throw error

        // Transform flat list to nested structure
        const menuByCategory: Record<string, any[]> = {}
        const itemsMap: Record<string, any> = {}

        data?.forEach((row: any) => {
            const itemId = row.menu_item_id

            if (!itemsMap[itemId]) {
                itemsMap[itemId] = {
                    name: row.menu_item_name,
                    category: row.category,
                    allergens: [],
                    traces: [],
                    ingredients: '', // Could fetch ingredients description if needed
                    supplier: ''
                }

                if (!menuByCategory[row.category]) {
                    menuByCategory[row.category] = []
                }
                menuByCategory[row.category].push(itemsMap[itemId])
            }

            if (row.allergen_id) {
                const allergen = {
                    name: row.allergen_name,
                    emoji: row.allergen_emoji
                }

                if (row.is_trace) {
                    itemsMap[itemId].traces.push(allergen)
                } else {
                    itemsMap[itemId].allergens.push(allergen)
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: menuByCategory
        })

    } catch (error) {
        console.error('Error fetching public menu:', error)
        return NextResponse.json(
            { error: 'Failed to fetch public menu' },
            { status: 500 }
        )
    }
}
