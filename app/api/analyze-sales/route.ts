import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
// @ts-ignore
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    let sales: any[] = []

    // Vérifier le type de contenu
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      // Mode JSON (Ré-analyse)
      const body = await request.json()
      sales = body.sales
    } else {
      // Mode Fichier (Upload)
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Lire le fichier Excel
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      // Extraire les ventes
      let currentCategory = ''

      for (let i = 2; i < data.length; i++) {
        const row: any = data[i]

        // Détecter catégorie
        if (row[0] && String(row[0]).startsWith('Total ')) {
          currentCategory = String(row[0]).replace('Total ', '').trim()
          continue
        }

        // Détecter article
        if (row[1] && currentCategory) {
          const article = String(row[1]).trim()
          const quantity = row[2] || 0
          const total_ttc = row[3] || 0

          if (quantity > 0) {
            sales.push({
              article,
              category: currentCategory,
              quantity,
              total_ttc
            })
          }
        }
      }
    }

    // Croiser avec la base de données
    const supabase = createSupabaseClient()

    // Récupérer tous les menu_items
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id, name, category')

    // Récupérer les recettes existantes (simplifié pour éviter les problèmes de jointure)
    const { data: recipes } = await supabase
      .from('recipes')
      .select('menu_item_id')

    // Créer un Set des menu_item_id qui ont des recettes
    const menuItemsWithRecipes = new Set(recipes?.map(r => r.menu_item_id) || [])

    // Enrichir les ventes
    const debugInfo: any[] = []

    const enrichedSales = sales.map(sale => {
      // Normaliser le nom de l'article pour le matching
      const normalizedArticle = sale.article
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ') // Remplacer multiples espaces par un seul

      const menuItem = menuItems?.find(mi => {
        const normalizedMenuItem = mi.name
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ')

        return normalizedMenuItem === normalizedArticle
      })

      // Debug: tracker les résultats
      const hasRecipe = menuItem ? menuItemsWithRecipes.has(menuItem.id) : false
      debugInfo.push({
        article: sale.article,
        found: !!menuItem,
        menu_item_id: menuItem?.id,
        has_recipe: hasRecipe,
        status: !menuItem ? 'not_found' : (hasRecipe ? 'has_recipe' : 'missing_recipe')
      })

      return {
        ...sale,
        has_recipe: hasRecipe,
        menu_item_id: menuItem?.id
      }
    })

    // Calculer les besoins fournisseurs (désactivé temporairement - nécessite requête détaillée)
    const supplierNeeds: Map<string, any> = new Map()

    // TODO: Réactiver le calcul des besoins fournisseurs avec une requête séparée si nécessaire

    // Trouver les recettes manquantes (Items connus mais sans recette)
    const missingRecipes = enrichedSales
      .filter(s => s.menu_item_id && !s.has_recipe)
      .map(s => s.article)

    // Trouver les items inconnus (Pas dans la table menu_items)
    const unknownItems = enrichedSales
      .filter(s => !s.menu_item_id)
      .map(s => ({
        article: s.article,
        category: s.category,
        price: s.total_ttc / s.quantity // Estimation du prix unitaire
      }))

    // Dédoublonner les items inconnus
    const uniqueUnknownItems = Array.from(new Set(unknownItems.map(i => i.article)))
      .map(name => unknownItems.find(i => i.article === name))

    return NextResponse.json({
      sales: enrichedSales,
      supplier_needs: Array.from(supplierNeeds.values()),
      missing_recipes: [...new Set(missingRecipes)],
      unknown_items: uniqueUnknownItems,
      debug_info: debugInfo.slice(0, 20) // Limiter à 20 pour ne pas surcharger
    })

  } catch (error) {
    console.error('Error analyzing sales:', error)
    return NextResponse.json(
      { error: 'Failed to analyze file' },
      { status: 500 }
    )
  }
}
