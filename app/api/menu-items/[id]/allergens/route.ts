import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = createSupabaseClient()
        const { id } = params

        const { data, error } = await supabase
            .rpc('get_menu_item_allergens', { p_menu_item_id: id })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching menu item allergens:', error)
        return NextResponse.json(
            { error: 'Failed to fetch menu item allergens' },
            { status: 500 }
        )
    }
}
