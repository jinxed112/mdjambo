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
            .rpc('get_product_allergens', { p_product_id: id })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching product allergens:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product allergens' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const supabase = createSupabaseClient()
        const { id } = params
        const body = await request.json()
        const { allergens } = body // Array of { allergen_id, is_trace }

        // 1. Delete existing allergens for this product
        const { error: deleteError } = await supabase
            .from('product_allergens')
            .delete()
            .eq('product_id', id)

        if (deleteError) throw deleteError

        // 2. Insert new allergens
        if (allergens && allergens.length > 0) {
            const rows = allergens.map((a: any) => ({
                product_id: id,
                allergen_id: a.allergen_id,
                is_trace: a.is_trace || false
            }))

            const { error: insertError } = await supabase
                .from('product_allergens')
                .insert(rows)

            if (insertError) throw insertError
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating product allergens:', error)
        return NextResponse.json(
            { error: 'Failed to update product allergens' },
            { status: 500 }
        )
    }
}
