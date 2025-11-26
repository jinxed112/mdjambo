import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET() {
    try {
        const supabase = createSupabaseClient()

        const { data, error } = await supabase
            .from('allergens')
            .select('*')
            .order('name_fr', { ascending: true })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching allergens:', error)
        return NextResponse.json(
            { error: 'Failed to fetch allergens' },
            { status: 500 }
        )
    }
}
