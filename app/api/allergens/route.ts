import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'

export async function GET() {
    try {
        const supabase = createSupabaseClient()

        // Récupérer tous les menu items actifs
        const { data: menuItems, error: menuError } = await supabase
            .from('menu_items')
            .select('id, name, category')
            .eq('is_active', true)
            .order('category', { ascending: true })
            .order('name', { ascending: true })

        if (menuError) throw menuError

        // Récupérer tous les produits avec leurs fournisseurs
        const { data: products, error: productsError } = await supabase
            .rpc('get_products_with_prices')

        if (productsError) throw productsError

        // Organiser les données par catégorie
        const menuByCategory: Record<string, any[]> = {}

        menuItems?.forEach(item => {
            if (!menuByCategory[item.category]) {
                menuByCategory[item.category] = []
            }
            menuByCategory[item.category].push({
                name: item.name,
                category: item.category,
                // Pour l'instant, pas d'allergènes en DB, on retourne vide
                allergens: [],
                traces: [],
                ingredients: '',
                supplier: ''
            })
        })

        // Ajouter aussi les produits fournisseurs dans une catégorie "Produits Fournisseurs"
        const supplierProducts: any[] = []
        products?.forEach((p: any) => {
            supplierProducts.push({
                name: p.product_name,
                category: 'Produits Fournisseurs',
                allergens: [],
                traces: [],
                ingredients: p.packaging_info || '',
                supplier: p.supplier_name || ''
            })
        })

        if (supplierProducts.length > 0) {
            menuByCategory['Produits Fournisseurs'] = supplierProducts
        }

        return NextResponse.json({
            success: true,
            data: menuByCategory
        })

    } catch (error) {
        console.error('Error fetching allergens data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch allergens data' },
            { status: 500 }
        )
    }
}
