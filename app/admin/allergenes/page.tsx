'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { Search, AlertTriangle, Check, Save, X, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Product {
    id: string
    name: string
    supplier_name: string
}

interface Allergen {
    id: string
    name: string // internal name
    name_fr: string // display name
    emoji: string
}

interface ProductAllergen {
    allergen_id: string
    is_trace: boolean
}

export default function AdminAllergenesPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [allergens, setAllergens] = useState<Allergen[]>([])
    const [productAllergens, setProductAllergens] = useState<Record<string, ProductAllergen[]>>({})
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Modal state
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [editedAllergens, setEditedAllergens] = useState<Record<string, boolean>>({}) // allergen_id -> is_selected
    const [editedTraces, setEditedTraces] = useState<Record<string, boolean>>({}) // allergen_id -> is_trace
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const supabase = createSupabaseClient()

            // 1. Load Allergens
            const { data: allergensData, error: allergensError } = await supabase
                .from('allergens')
                .select('*')
                .order('name_fr')

            if (allergensError) throw allergensError
            setAllergens(allergensData)

            // 2. Load Products
            const { data: productsData, error: productsError } = await supabase
                .rpc('get_products_with_prices')

            if (productsError) throw productsError

            const mappedProducts = productsData.map((p: any) => ({
                id: p.product_id,
                name: p.product_name,
                supplier_name: p.supplier_name
            }))
            setProducts(mappedProducts)

            // 3. Load All Product Allergens
            const { data: paData, error: paError } = await supabase
                .from('product_allergens')
                .select('product_id, allergen_id, is_trace')

            if (paError) throw paError

            const paMap: Record<string, ProductAllergen[]> = {}
            paData?.forEach((pa: any) => {
                if (!paMap[pa.product_id]) paMap[pa.product_id] = []
                paMap[pa.product_id].push({
                    allergen_id: pa.allergen_id,
                    is_trace: pa.is_trace
                })
            })
            setProductAllergens(paMap)

        } catch (error) {
            console.error('Error loading data:', error)
            toast.error('Erreur lors du chargement des données')
        } finally {
            setLoading(false)
        }
    }

    const openModal = (product: Product) => {
        setSelectedProduct(product)

        // Initialize state from existing data
        const current = productAllergens[product.id] || []
        const selected: Record<string, boolean> = {}
        const traces: Record<string, boolean> = {}

        current.forEach(pa => {
            selected[pa.allergen_id] = true
            if (pa.is_trace) traces[pa.allergen_id] = true
        })

        setEditedAllergens(selected)
        setEditedTraces(traces)
    }

    const closeModal = () => {
        setSelectedProduct(null)
        setEditedAllergens({})
        setEditedTraces({})
    }

    const toggleAllergen = (allergenId: string) => {
        setEditedAllergens(prev => ({
            ...prev,
            [allergenId]: !prev[allergenId]
        }))
        // If unchecking, also remove trace
        if (editedAllergens[allergenId]) {
            setEditedTraces(prev => ({
                ...prev,
                [allergenId]: false
            }))
        }
    }

    const toggleTrace = (allergenId: string) => {
        setEditedTraces(prev => ({
            ...prev,
            [allergenId]: !prev[allergenId]
        }))
        // If checking trace, ensure allergen is selected
        if (!editedTraces[allergenId]) {
            setEditedAllergens(prev => ({
                ...prev,
                [allergenId]: true
            }))
        }
    }

    const saveAllergens = async () => {
        if (!selectedProduct) return

        try {
            setSaving(true)

            // Prepare payload
            const payload = Object.entries(editedAllergens)
                .filter(([_, isSelected]) => isSelected)
                .map(([allergenId, _]) => ({
                    allergen_id: allergenId,
                    is_trace: editedTraces[allergenId] || false
                }))

            const response = await fetch(`/api/products/${selectedProduct.id}/allergens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ allergens: payload })
            })

            if (!response.ok) throw new Error('Failed to save')

            toast.success('Allergènes mis à jour')

            // Update local state
            setProductAllergens(prev => ({
                ...prev,
                [selectedProduct.id]: payload
            }))

            closeModal()
        } catch (error) {
            console.error('Error saving:', error)
            toast.error('Erreur lors de la sauvegarde')
        } finally {
            setSaving(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="text-red-600" />
                    Gestion des Allergènes Produits
                </h1>
                <div className="text-sm text-gray-500">
                    {products.length} produits • {Object.keys(productAllergens).length} configurés
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Rechercher un produit ou un fournisseur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
            </div>

            {/* Products List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Produit</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fournisseur</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Allergènes</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredProducts.map((product) => {
                            const pas = productAllergens[product.id] || []
                            const hasAllergens = pas.length > 0

                            return (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{product.supplier_name}</td>
                                    <td className="px-6 py-4">
                                        {hasAllergens ? (
                                            <div className="flex flex-wrap gap-1">
                                                {pas.map((pa, idx) => {
                                                    const allergen = allergens.find(a => a.id === pa.allergen_id)
                                                    if (!allergen) return null
                                                    return (
                                                        <span
                                                            key={idx}
                                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${pa.is_trace
                                                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                                                }`}
                                                        >
                                                            {allergen.emoji} {allergen.name_fr}
                                                            {pa.is_trace && ' (Tr)'}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm italic flex items-center gap-1">
                                                <Info size={14} /> Non configuré
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openModal(product)}
                                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                                        >
                                            Gérer
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Allergènes : {selectedProduct.name}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {allergens.map((allergen) => (
                                    <div
                                        key={allergen.id}
                                        className={`
                      flex items-center justify-between p-3 rounded-lg border transition-all
                      ${editedAllergens[allergen.id]
                                                ? 'border-red-200 bg-red-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id={`alg-${allergen.id}`}
                                                checked={!!editedAllergens[allergen.id]}
                                                onChange={() => toggleAllergen(allergen.id)}
                                                className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
                                            />
                                            <label htmlFor={`alg-${allergen.id}`} className="font-medium text-gray-900 cursor-pointer select-none flex items-center gap-2">
                                                <span className="text-xl">{allergen.emoji}</span>
                                                {allergen.name_fr}
                                            </label>
                                        </div>

                                        {editedAllergens[allergen.id] && (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={`trace-${allergen.id}`}
                                                    checked={!!editedTraces[allergen.id]}
                                                    onChange={() => toggleTrace(allergen.id)}
                                                    className="w-4 h-4 text-yellow-500 rounded focus:ring-yellow-500 border-gray-300"
                                                />
                                                <label htmlFor={`trace-${allergen.id}`} className="text-sm text-gray-600 cursor-pointer select-none">
                                                    Trace ?
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={saveAllergens}
                                disabled={saving}
                                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Sauvegarde...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Enregistrer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
