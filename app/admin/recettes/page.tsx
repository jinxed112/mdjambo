'use client'
import { useState, useEffect } from 'react'
import { ChefHat, Trash2, Search, Edit2, Save, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { createSupabaseClient } from '@/lib/supabase'

type Ingredient = {
  recipe_id: string
  product_id: string
  product_name: string
  quantity: number
  unit: string
  unit_price: number
  cost: number
}

type Recipe = {
  id: string
  menu_item_name: string
  category: string
  selling_price_ttc: number
  ingredients: Ingredient[]
  total_cost: number
  margin: number
  margin_percent: number
}

export default function RecettesPage() {
  // New State
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingRecipeId, setAddingRecipeId] = useState<string | null>(null)
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  // Existing State
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(0)

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      const supabase = createSupabaseClient()

      const { data: recipeData, error } = await supabase
        .from('recipes')
        .select('id, menu_item_id, product_id, quantity')

      if (error) throw error

      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('id, name, category, selling_price_ttc')
        .eq('is_active', true)

      const { data: products } = await supabase
        .from('products')
        .select('id, name, unit_id')

      const { data: units } = await supabase
        .from('units')
        .select('id, abbreviation')

      // Récupérer unit_price ET units_per_package
      const { data: supplierProducts } = await supabase
        .from('supplier_products')
        .select('product_id, unit_price, units_per_package')

      const menuItemsMap = new Map(menuItems?.map(m => [m.id, m]) || [])
      const productsMap = new Map(products?.map(p => [p.id, p]) || [])
      const unitsMap = new Map(units?.map(u => [u.id, u]) || [])

      // CALCULER LE VRAI PRIX UNITAIRE = unit_price / units_per_package
      const pricesMap = new Map(supplierProducts?.map(sp => [
        sp.product_id,
        sp.unit_price / (sp.units_per_package || 1)
      ]) || [])

      const recipesGrouped = new Map<string, Recipe>()

      recipeData?.forEach(r => {
        const menuItem = menuItemsMap.get(r.menu_item_id)
        const product = productsMap.get(r.product_id)
        const unit = product?.unit_id ? unitsMap.get(product.unit_id) : null
        const unitPrice = pricesMap.get(r.product_id) || 0

        if (!menuItem || !product) return

        if (!recipesGrouped.has(r.menu_item_id)) {
          recipesGrouped.set(r.menu_item_id, {
            id: r.menu_item_id,
            menu_item_name: menuItem.name,
            category: menuItem.category,
            selling_price_ttc: menuItem.selling_price_ttc,
            ingredients: [],
            total_cost: 0,
            margin: 0,
            margin_percent: 0
          })
        }

        const recipe = recipesGrouped.get(r.menu_item_id)!
        const cost = r.quantity * unitPrice

        recipe.ingredients.push({
          recipe_id: r.id,
          product_id: r.product_id,
          product_name: product.name,
          quantity: r.quantity,
          unit: unit?.abbreviation || '',
          unit_price: unitPrice,
          cost
        })

        recipe.total_cost += cost
      })

      recipesGrouped.forEach(recipe => {
        recipe.margin = recipe.selling_price_ttc - recipe.total_cost
        recipe.margin_percent = recipe.selling_price_ttc > 0
          ? (recipe.margin / recipe.selling_price_ttc) * 100
          : 0
      })

      const recipesArray = Array.from(recipesGrouped.values())
        .sort((a, b) => a.category.localeCompare(b.category) || a.menu_item_name.localeCompare(b.menu_item_name))

      setRecipes(recipesArray)

    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur chargement recettes')
    } finally {
      setLoading(false)
    }
  }

  const searchProducts = async (term: string) => {
    setProductSearchTerm(term)
    if (term.length < 2) {
      setSearchResults([])
      return
    }

    try {
      setSearching(true)
      const supabase = createSupabaseClient()
      const { data, error } = await supabase.rpc('get_products_with_prices')

      if (error) throw error

      const filtered = (data || []).filter((p: any) =>
        p.product_name.toLowerCase().includes(term.toLowerCase()) ||
        p.supplier_name?.toLowerCase().includes(term.toLowerCase())
      )

      setSearchResults(filtered.slice(0, 10))
    } catch (error) {
      console.error(error)
    } finally {
      setSearching(false)
    }
  }

  const handleAddIngredient = async (product: any) => {
    if (!addingRecipeId) return

    try {
      const supabase = createSupabaseClient()

      // On ajoute avec une quantité de 0 par défaut, l'utilisateur modifiera ensuite
      const { error } = await supabase.rpc('create_recipe_item', {
        p_menu_item_id: addingRecipeId,
        p_product_id: product.product_id,
        p_quantity: 0
      })

      if (error) throw error

      toast.success('Ingrédient ajouté')
      setShowAddModal(false)
      setProductSearchTerm('')
      setSearchResults([])
      loadRecipes()

    } catch (error) {
      console.error(error)
      toast.error('Erreur ajout ingrédient')
    }
  }

  const openAddModal = (recipeId: string) => {
    setAddingRecipeId(recipeId)
    setShowAddModal(true)
    setProductSearchTerm('')
    setSearchResults([])
  }

  const startEdit = (ing: Ingredient) => {
    setEditingIngredient(ing.recipe_id)
    setEditQuantity(ing.quantity)
  }

  const cancelEdit = () => {
    setEditingIngredient(null)
    setEditQuantity(0)
  }

  const saveEdit = async (recipeId: string) => {
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase
        .from('recipes')
        .update({ quantity: editQuantity })
        .eq('id', recipeId)

      if (error) throw error

      toast.success('Quantité mise à jour')
      setEditingIngredient(null)
      loadRecipes()
    } catch (error) {
      toast.error('Erreur mise à jour')
    }
  }

  const deleteIngredient = async (recipeId: string) => {
    if (!confirm('Supprimer cet ingrédient ?')) return

    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.from('recipes').delete().eq('id', recipeId)
      if (error) throw error
      toast.success('Supprimé')
      loadRecipes()
    } catch (error) {
      toast.error('Erreur suppression')
    }
  }

  const deleteRecipe = async (menuItemId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer TOUTE la recette pour cet article ?')) return

    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.from('recipes').delete().eq('menu_item_id', menuItemId)
      if (error) throw error
      toast.success('Recette supprimée')
      loadRecipes()
    } catch (error) {
      console.error(error)
      toast.error('Erreur suppression recette')
    }
  }

  const filteredRecipes = recipes.filter(r =>
    r.menu_item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedByCategory = filteredRecipes.reduce((acc, recipe) => {
    if (!acc[recipe.category]) acc[recipe.category] = []
    acc[recipe.category].push(recipe)
    return acc
  }, {} as Record<string, Recipe[]>)

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChefHat size={32} />
            Recettes
          </h1>
          <p className="text-gray-600 mt-1">{recipes.length} articles avec recettes</p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Quantités moyennes pour un burger</h3>
        <ul className="text-sm text-blue-800 grid grid-cols-2 md:grid-cols-4 gap-2">
          <li>Viande : 0.15-0.21 kg</li>
          <li>Pain : 1 pce</li>
          <li>Sauce : 0.02 L (20ml)</li>
          <li>Fromage : 1-2 tranches</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un article..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {Object.entries(groupedByCategory).map(([category, categoryRecipes]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
              {category}
            </span>
            <span className="text-gray-500 text-sm font-normal">
              ({categoryRecipes.length} articles)
            </span>
          </h2>

          <div className="grid gap-4">
            {categoryRecipes.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedRecipe(selectedRecipe === recipe.id ? null : recipe.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{recipe.menu_item_name}</h3>
                      <p className="text-sm text-gray-500">
                        {recipe.ingredients.length} ingrédient(s)
                      </p>
                    </div>
                    <div className="text-right px-4">
                      <div className="text-sm text-gray-500">Prix vente</div>
                      <div className="font-bold text-lg">{recipe.selling_price_ttc.toFixed(2)}€</div>
                    </div>
                    <div className="text-right px-4">
                      <div className="text-sm text-gray-500">Coût</div>
                      <div className="font-bold text-lg text-orange-600">{recipe.total_cost.toFixed(2)}€</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Marge</div>
                      <div className={`font-bold text-lg ${recipe.margin_percent >= 60 ? 'text-green-600' : recipe.margin_percent >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {recipe.margin.toFixed(2)}€ ({recipe.margin_percent.toFixed(0)}%)
                      </div>
                    </div>
                    <div className="pl-4 flex items-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Supprimer toute la recette"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {selectedRecipe === recipe.id && (
                  <div className="border-t bg-gray-50 p-4">
                    <table className="w-full mb-4">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase">
                          <th className="pb-2">Ingrédient</th>
                          <th className="pb-2 text-right">Quantité</th>
                          <th className="pb-2 text-right">Prix unit.</th>
                          <th className="pb-2 text-right">Coût</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {recipe.ingredients.map(ing => (
                          <tr key={ing.recipe_id}>
                            <td className="py-2 font-medium">{ing.product_name}</td>
                            <td className="py-2 text-right">
                              {editingIngredient === ing.recipe_id ? (
                                <input
                                  type="number"
                                  step="0.001"
                                  value={editQuantity}
                                  onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 0)}
                                  className="w-24 px-2 py-1 border rounded text-right"
                                  autoFocus
                                />
                              ) : (
                                <span>{ing.quantity} {ing.unit}</span>
                              )}
                            </td>
                            <td className="py-2 text-right">{ing.unit_price.toFixed(4)}€</td>
                            <td className="py-2 text-right font-semibold">
                              {editingIngredient === ing.recipe_id
                                ? (editQuantity * ing.unit_price).toFixed(2)
                                : ing.cost.toFixed(2)}€
                            </td>
                            <td className="py-2 text-right">
                              <div className="flex gap-2 justify-end">
                                {editingIngredient === ing.recipe_id ? (
                                  <>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); saveEdit(ing.recipe_id); }}
                                      className="text-green-600 hover:text-green-800"
                                    >
                                      <Save size={16} />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                                      className="text-gray-600 hover:text-gray-800"
                                    >
                                      <X size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); startEdit(ing); }}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteIngredient(ing.recipe_id); }}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-bold border-t-2">
                          <td colSpan={3} className="pt-2 text-right">TOTAL :</td>
                          <td className="pt-2 text-right text-orange-600">{recipe.total_cost.toFixed(2)}€</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>

                    <button
                      onClick={() => openAddModal(recipe.id)}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Ajouter un ingrédient
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal Ajout Ingrédient */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Ajouter un ingrédient</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher un produit</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  value={productSearchTerm}
                  onChange={(e) => searchProducts(e.target.value)}
                  placeholder="Nom du produit..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
              {searching ? (
                <div className="p-4 text-center text-gray-500">Recherche...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <button
                    key={product.product_id}
                    onClick={() => handleAddIngredient(product)}
                    className="w-full p-3 text-left hover:bg-gray-50 flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-medium group-hover:text-red-600">{product.product_name}</div>
                      <div className="text-xs text-gray-500">{product.supplier_name}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      {parseFloat(product.unit_price).toFixed(2)}€ / {product.unit_abbr || 'unité'}
                    </div>
                  </button>
                ))
              ) : productSearchTerm.length >= 2 ? (
                <div className="p-4 text-center text-gray-500">Aucun produit trouvé</div>
              ) : (
                <div className="p-4 text-center text-gray-400">Tapez au moins 2 caractères</div>
              )}
            </div>
          </div>
        </div>
      )}

      {recipes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ChefHat size={64} className="mx-auto mb-4 opacity-50" />
          <p>Aucune recette créée</p>
          <p className="text-sm mt-2">Va dans Analyse Ventes pour créer des recettes</p>
        </div>
      )}
    </div>
  )
}