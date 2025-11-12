'use client'

import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Plus, Search, Grid3x3, List, GripVertical, Download, Edit2, Trash2, Package, Move, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Image from 'next/image'

type Product = {
  product_id: string
  product_name: string
  description?: string
  image_url?: string
  packaging_info?: string
  category_name: string
  supplier_id: string
  supplier_name: string
  supplier_city: string
  supplier_phone: string
  unit_price: number
  vat_rate: number
  unit_name: string
  unit_abbr: string
  custom_order?: number
  is_active?: boolean
  deleted_at?: string | null
}

type CartItem = {
  product: Product
  quantity: number
}

type Supplier = {
  id: string
  name: string
  city: string
  phone: string
}

type ViewMode = 'grid' | 'list'

export default function CommandeFournisseurs() {
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')
  const [cart, setCart] = useState<Record<string, CartItem[]>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [reorganizeMode, setReorganizeMode] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [cartNotification, setCartNotification] = useState<string | null>(null)
  const scrollPositionRef = useRef<number>(0)

  useEffect(() => {
    loadData()
    const savedViewMode = localStorage.getItem('viewMode') as ViewMode
    if (savedViewMode) setViewMode(savedViewMode)
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    try {
      const data = await api.callRPC('get_products_with_prices', {})
      
      const validProducts = data.filter((p: Product) => 
        p.supplier_id && 
        p.supplier_name && 
        p.unit_price && 
        p.unit_price > 0
      )
      
      const savedOrders = JSON.parse(localStorage.getItem('productOrders') || '{}')
      
      const productsWithOrder = validProducts.map((p: Product, index: number) => ({
        ...p,
        custom_order: savedOrders[p.product_id] ?? index
      }))
      
      setProducts(productsWithOrder)
      
      const uniqueSuppliers = Array.from(
        new Map(
          validProducts.map((p: Product) => [
            p.supplier_id,
            {
              id: p.supplier_id,
              name: p.supplier_name,
              city: p.supplier_city,
              phone: p.supplier_phone
            }
          ])
        ).values()
      ) as Supplier[]
      
      setSuppliers(uniqueSuppliers)
      
      if (uniqueSuppliers.length > 0 && !selectedSupplier) {
        setSelectedSupplier(uniqueSuppliers[0].id)
      }
      
    } catch (err) {
      console.error('Erreur:', err)
      alert('❌ Erreur de chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products
    .filter(p => {
      const matchesSupplier = p.supplier_id === selectedSupplier
      const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || p.category_name === selectedCategory
      const matchesDeletedFilter = showDeleted || p.is_active !== false
      return matchesSupplier && matchesSearch && matchesCategory && matchesDeletedFilter
    })
    .sort((a, b) => (a.custom_order ?? 0) - (b.custom_order ?? 0))

  const categories = Array.from(
    new Set(
      products
        .filter(p => p.supplier_id === selectedSupplier)
        .map(p => p.category_name)
    )
  ).sort()

  const addToCart = (product: Product) => {
    setCart(prev => {
      const supplierId = product.supplier_id
      const supplierCart = prev[supplierId] || []
      const existingItem = supplierCart.find(item => item.product.product_id === product.product_id)
      
      if (existingItem) {
        // Afficher notification avec le nouveau compteur
        setCartNotification(`+1`)
        setTimeout(() => setCartNotification(null), 800)
        
        return {
          ...prev,
          [supplierId]: supplierCart.map(item =>
            item.product.product_id === product.product_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
      }
      
      // Nouveau produit ajouté
      setCartNotification('+1')
      setTimeout(() => setCartNotification(null), 800)
      
      return {
        ...prev,
        [supplierId]: [...supplierCart, { product, quantity: 1 }]
      }
    })
  }

  const updateQuantity = (supplierId: string, productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(supplierId, productId)
      return
    }
    
    setCart(prev => ({
      ...prev,
      [supplierId]: prev[supplierId].map(item =>
        item.product.product_id === productId
          ? { ...item, quantity }
          : item
      )
    }))
  }

  const removeFromCart = (supplierId: string, productId: string) => {
    setCart(prev => ({
      ...prev,
      [supplierId]: prev[supplierId].filter(item => item.product.product_id !== productId)
    }))
  }

  const generatePDF = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId)
    const items = cart[supplierId] || []
    
    if (!supplier || items.length === 0) return

    const doc = new jsPDF()
    
    // En-tête
    doc.setFontSize(20)
    doc.text('Commande MDjambo', 14, 20)
    
    doc.setFontSize(10)
    doc.text(`Fournisseur: ${supplier.name}`, 14, 30)
    doc.text(`Ville: ${supplier.city}`, 14, 36)
    doc.text(`Téléphone: ${supplier.phone}`, 14, 42)
    doc.text(`Date: ${new Date().toLocaleDateString('fr-BE')}`, 14, 48)

    // Tableau des produits
    const tableData = items.map(item => {
      const priceHT = item.product.unit_price * item.quantity
      const priceTTC = priceHT * (1 + item.product.vat_rate / 100)
      
      return [
        item.product.product_name,
        item.product.category_name,
        item.product.packaging_info || '-',
        item.quantity.toString(),
        `${item.product.unit_price.toFixed(2)}€`,
        `${priceHT.toFixed(2)}€`,
        `${priceTTC.toFixed(2)}€`
      ]
    })

    autoTable(doc, {
      startY: 55,
      head: [['Produit', 'Catégorie', 'Conditionnement', 'Qté', 'Prix HT', 'Total HT', 'Total TTC']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 }
    })

    // Totaux
    const totalHT = items.reduce((sum, item) => 
      sum + (item.product.unit_price * item.quantity), 0
    )
    const totalTTC = items.reduce((sum, item) => 
      sum + (item.product.unit_price * item.quantity * (1 + item.product.vat_rate / 100)), 0
    )

    const finalY = (doc as any).lastAutoTable.finalY || 55
    doc.setFontSize(12)
    doc.text(`Total HT: ${totalHT.toFixed(2)}€`, 14, finalY + 10)
    doc.text(`Total TTC: ${totalTTC.toFixed(2)}€`, 14, finalY + 18)

    doc.save(`commande_${supplier.name.replace(/\s/g, '_')}_${Date.now()}.pdf`)
  }

  const clearCart = (supplierId: string) => {
    if (confirm('Vider le panier ?')) {
      setCart(prev => ({
        ...prev,
        [supplierId]: []
      }))
    }
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Mettre "${productName}" à la corbeille ?\n\nTu pourras le restaurer depuis la corbeille.`)) {
      return
    }

    try {
      // Sauvegarder la position de scroll
      scrollPositionRef.current = window.scrollY

      await api.update('products', productId, {
        is_active: false,
        deleted_at: new Date().toISOString()
      })

      alert('✅ Produit mis à la corbeille !')
      await loadData()
      
      // Restaurer la position de scroll
      setTimeout(() => {
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
      }, 50)
    } catch (err) {
      console.error('Erreur:', err)
      alert('❌ Erreur lors de la suppression du produit')
    }
  }

  const handleRestoreProduct = async (productId: string, productName: string) => {
    if (!confirm(`Restaurer "${productName}" ?`)) {
      return
    }

    try {
      // Sauvegarder la position de scroll
      scrollPositionRef.current = window.scrollY

      await api.update('products', productId, {
        is_active: true,
        deleted_at: null
      })

      alert('✅ Produit restauré !')
      await loadData()
      
      // Restaurer la position de scroll
      setTimeout(() => {
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
      }, 50)
    } catch (err) {
      console.error('Erreur:', err)
      alert('❌ Erreur lors de la restauration')
    }
  }

  const handleDeletePermanently = async (productId: string, productName: string) => {
    if (!confirm(`SUPPRIMER DÉFINITIVEMENT "${productName}" ?\n\n⚠️ ATTENTION : Cette action est IRRÉVERSIBLE !`)) {
      return
    }

    if (!confirm(`Es-tu VRAIMENT sûr de vouloir supprimer définitivement "${productName}" ?\n\nIl sera impossible de le récupérer !`)) {
      return
    }

    try {
      // Sauvegarder la position de scroll
      scrollPositionRef.current = window.scrollY

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/products?id=eq.${productId}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      alert('✅ Produit supprimé définitivement')
      await loadData()
      
      // Restaurer la position de scroll
      setTimeout(() => {
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
      }, 50)
    } catch (err) {
      console.error('Erreur:', err)
      alert('❌ Erreur lors de la suppression définitive')
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const newProducts = [...filteredProducts]
    const [draggedProduct] = newProducts.splice(draggedIndex, 1)
    newProducts.splice(dropIndex, 0, draggedProduct)

    const updatedProducts = newProducts.map((product, idx) => ({
      ...product,
      custom_order: idx
    }))

    setProducts(prevProducts => {
      const otherProducts = prevProducts.filter(p => p.supplier_id !== selectedSupplier)
      return [...otherProducts, ...updatedProducts].sort((a, b) => 
        (a.custom_order ?? 0) - (b.custom_order ?? 0)
      )
    })

    const orderMap: Record<string, number> = {}
    updatedProducts.forEach((product, idx) => {
      orderMap[product.product_id] = idx
    })
    
    const existingOrders = JSON.parse(localStorage.getItem('productOrders') || '{}')
    const newOrders = { ...existingOrders, ...orderMap }
    localStorage.setItem('productOrders', JSON.stringify(newOrders))

    setDraggedIndex(null)
  }

  const currentSupplier = suppliers.find(s => s.id === selectedSupplier)
  const currentCart = cart[selectedSupplier] || []
  const cartTotal = currentCart.reduce((sum, item) => 
    sum + (item.product.unit_price * item.quantity * (1 + item.product.vat_rate / 100)), 0
  )
  const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-800">Chargement des produits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* En-tête avec sélection fournisseur */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-2">🛒 Commande Fournisseurs</h1>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.city}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton panier desktop seulement */}
          <button
            onClick={() => setShowCart(true)}
            className="hidden sm:flex relative bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition items-center gap-2 whitespace-nowrap"
          >
            <ShoppingCart size={18} />
            Panier
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-900 placeholder:text-gray-500"
            />
          </div>

          {/* Barre ultra-compacte fusionnée */}
          <div className="flex gap-0.5 items-center bg-gray-100 p-0.5 rounded-lg shadow-sm">
            <button
              onClick={() => {
                setViewMode('list')
                localStorage.setItem('viewMode', 'list')
              }}
              className={`p-1.5 rounded transition ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-700 hover:bg-white'
              }`}
              title="Liste"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => {
                setViewMode('grid')
                localStorage.setItem('viewMode', 'grid')
              }}
              className={`p-1.5 rounded transition ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-gray-700 hover:bg-white'
              }`}
              title="Grille"
            >
              <Grid3x3 size={16} />
            </button>
            
            <div className="w-px h-5 bg-gray-300 mx-0.5"></div>
            
            <button
              onClick={() => setReorganizeMode(!reorganizeMode)}
              className={`p-1.5 rounded transition ${
                reorganizeMode
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-white'
              }`}
              title={reorganizeMode ? 'Figer' : 'Réorganiser'}
            >
              <Move size={16} />
            </button>
            
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`p-1.5 rounded transition ${
                showDeleted
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-white'
              }`}
              title={showDeleted ? 'Masquer supprimés' : 'Corbeille'}
            >
              {showDeleted ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            
            <div className="w-px h-5 bg-gray-300 mx-0.5"></div>
            
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-green-600 text-white px-2 py-1.5 rounded hover:bg-green-700 transition flex items-center gap-1 text-xs font-medium shadow-sm"
            >
              <Plus size={14} />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des produits */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Photo</th>
                  <th className="px-4 py-3 text-left font-bold">Produit</th>
                  <th className="px-4 py-3 text-left font-bold">Catégorie</th>
                  <th className="px-4 py-3 text-left font-bold">Conditionnement</th>
                  <th className="px-4 py-3 text-left font-bold">Prix HT</th>
                  <th className="px-4 py-3 text-left font-bold">Prix TTC</th>
                  <th className="px-4 py-3 text-left font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => {
                  const priceTTC = product.unit_price * (1 + product.vat_rate / 100)
                  const isDeleted = product.is_active === false
                  
                  return (
                    <tr 
                      key={product.product_id} 
                      draggable={reorganizeMode && !isDeleted}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`border-b transition ${
                        isDeleted 
                          ? 'bg-red-50 opacity-60' 
                          : 'hover:bg-blue-50'
                      } ${
                        reorganizeMode && !isDeleted ? 'cursor-move' : ''
                      } ${
                        draggedIndex === index ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {product.image_url ? (
                            <Image 
                              src={product.image_url} 
                              alt={product.product_name}
                              width={64}
                              height={64}
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <Package className="text-gray-400" size={32} />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{product.product_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {product.category_name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">
                        {product.packaging_info || '-'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {product.unit_price.toFixed(2)}€
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600">
                        {priceTTC.toFixed(2)}€
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 items-center">
                          {reorganizeMode && !isDeleted && (
                            <div className="p-2 text-gray-400 cursor-move">
                              <GripVertical size={18} />
                            </div>
                          )}
                          
                          {isDeleted ? (
                            <>
                              <button
                                onClick={() => handleRestoreProduct(product.product_id, product.product_name)}
                                className="p-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition flex items-center gap-1 font-medium"
                                title="Restaurer"
                              >
                                <RotateCcw size={18} />
                                <span className="text-sm">Restaurer</span>
                              </button>
                              <button
                                onClick={() => handleDeletePermanently(product.product_id, product.product_name)}
                                className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Supprimer définitivement"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Modifier"
                                disabled={reorganizeMode}
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.product_id, product.product_name)}
                                className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Mettre à la corbeille"
                                disabled={reorganizeMode}
                              >
                                <Trash2 size={18} />
                              </button>
                              <button
                                onClick={() => addToCart(product)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                disabled={reorganizeMode}
                              >
                                Ajouter
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredProducts.map((product, index) => {
              const priceTTC = product.unit_price * (1 + product.vat_rate / 100)
              const isDeleted = product.is_active === false
              
              return (
                <div 
                  key={product.product_id} 
                  draggable={reorganizeMode && !isDeleted}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`bg-white border-2 rounded-xl overflow-hidden transition ${
                    isDeleted 
                      ? 'border-red-300 bg-red-50 opacity-60' 
                      : 'border-gray-200 hover:shadow-lg hover:border-blue-300'
                  } ${
                    reorganizeMode && !isDeleted ? 'cursor-move' : ''
                  } ${
                    draggedIndex === index ? 'opacity-50' : ''
                  }`}
                >
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <Image 
                        src={product.image_url} 
                        alt={product.product_name}
                        width={300}
                        height={200}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <Package className="text-gray-400" size={64} />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{product.product_name}</h3>
                    <p className="text-sm text-gray-800 mb-2 font-medium">{product.packaging_info || 'Conditionnement standard'}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {product.category_name}
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-gray-800 font-medium">HT: {product.unit_price.toFixed(2)}€</div>
                        <div className="text-lg font-bold text-blue-600">TTC: {priceTTC.toFixed(2)}€</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isDeleted ? (
                        <>
                          <button
                            onClick={() => handleRestoreProduct(product.product_id, product.product_name)}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                            title="Restaurer"
                          >
                            <RotateCcw size={18} />
                            <span>Restaurer</span>
                          </button>
                          <button
                            onClick={() => handleDeletePermanently(product.product_id, product.product_name)}
                            className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer définitivement"
                          >
                            <Trash2 size={18} className="mx-auto" />
                          </button>
                        </>
                      ) : (
                        <>
                          {reorganizeMode && (
                            <div className="p-2 text-gray-400">
                              <GripVertical size={18} className="mx-auto" />
                            </div>
                          )}
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Modifier"
                            disabled={reorganizeMode}
                          >
                            <Edit2 size={18} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.product_id, product.product_name)}
                            className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Mettre à la corbeille"
                            disabled={reorganizeMode}
                          >
                            <Trash2 size={18} className="mx-auto" />
                          </button>
                          <button
                            onClick={() => addToCart(product)}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                            disabled={reorganizeMode}
                          >
                            Ajouter
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bouton Panier Flottant FIXE (mobile et desktop) */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95"
        aria-label="Ouvrir le panier"
      >
        <ShoppingCart size={24} />
        {totalItems > 0 && (
          <>
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg">
              {totalItems}
            </span>
            {/* Notification d'ajout */}
            {cartNotification && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-1 animate-ping">
                {cartNotification}
              </span>
            )}
          </>
        )}
      </button>

      {/* Modal Panier */}
      {showCart && (
        <CartModal
          items={currentCart}
          supplier={currentSupplier}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onClear={() => clearCart(selectedSupplier)}
          onGeneratePDF={() => generatePDF(selectedSupplier)}
          total={cartTotal}
        />
      )}

      {/* Modal Ajout/Edition Produit */}
      {(showAddProduct || editingProduct) && (
        <ProductModal
          product={editingProduct}
          supplierId={selectedSupplier}
          onClose={() => {
            setShowAddProduct(false)
            setEditingProduct(null)
          }}
          onSuccess={async () => {
            // Sauvegarder la position de scroll actuelle
            scrollPositionRef.current = window.scrollY
            
            setShowAddProduct(false)
            setEditingProduct(null)
            
            // Recharger les données
            await loadData()
            
            // Restaurer la position de scroll après un court délai
            setTimeout(() => {
              window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
            }, 50)
          }}
        />
      )}
    </div>
  )
}

// Composant Modal Panier
function CartModal({ 
  items, 
  supplier, 
  onClose, 
  onUpdateQuantity, 
  onRemove, 
  onClear, 
  onGeneratePDF,
  total 
}: any) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">🛒 Panier</h2>
          <button onClick={onClose} className="text-white hover:bg-blue-700 p-2 rounded-lg">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Panier vide</p>
            </div>
          ) : (
            <>
              {items.map((item: CartItem) => (
                <div key={item.product.product_id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.product.product_name}</h3>
                      <p className="text-sm text-gray-800 font-medium">{item.product.packaging_info}</p>
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        {(item.product.unit_price * (1 + item.product.vat_rate / 100)).toFixed(2)}€ TTC × {item.quantity}
                      </p>
                      <p className="text-base font-bold text-gray-900 mt-1">
                        Total: {(item.product.unit_price * (1 + item.product.vat_rate / 100) * item.quantity).toFixed(2)}€
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.product.supplier_id, item.product.product_id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onUpdateQuantity(item.product.supplier_id, item.product.product_id, item.quantity - 1)}
                      className="bg-gray-200 hover:bg-gray-300 w-10 h-10 rounded-lg font-bold text-gray-900"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(item.product.supplier_id, item.product.product_id, parseInt(e.target.value) || 0)}
                      className="w-20 text-center border-2 border-gray-300 rounded-lg py-2 font-semibold text-gray-900"
                    />
                    <button
                      onClick={() => onUpdateQuantity(item.product.supplier_id, item.product.product_id, item.quantity + 1)}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div className="border-t-2 pt-4">
                <div className="flex justify-between items-center text-xl font-bold mb-4">
                  <span className="text-gray-900">Total TTC:</span>
                  <span className="text-blue-600">{total.toFixed(2)}€</span>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={onGeneratePDF}
                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Télécharger PDF
                  </button>
                  <button
                    onClick={onClear}
                    className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition"
                  >
                    Vider le panier
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// Composant Modal Produit
function ProductModal({ product, supplierId, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: product?.product_name || '',
    description: product?.description || '',
    category_id: product?.category_id || '',
    packaging_info: product?.packaging_info || '',
    notes: product?.notes || '',
    image_url: product?.image_url || '',
    unit_price: product?.unit_price || '',
    vat_rate: product?.vat_rate || '6'
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(product?.image_url || '')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Erreur chargement catégories:', err)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('❌ Seulement des images')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('❌ Image trop grosse (max 5MB)')
      return
    }

    setImageFile(file)
    
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url || null

    setUploading(true)
    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (err) {
      console.error('Erreur upload:', err)
      alert('❌ Erreur lors de l\'upload de l\'image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const imageUrl = await uploadImage()
      
      const productData = {
        name: formData.name,
        description: formData.description,
        packaging_info: formData.packaging_info,
        notes: formData.notes,
        image_url: imageUrl || formData.image_url,
        category_id: formData.category_id || null
      }

      let productId = product?.product_id

      if (product) {
        await api.update('products', product.product_id, productData)
      } else {
        const newProduct = await api.create('products', productData)
        productId = newProduct.id
      }

      if (supplierId && formData.unit_price) {
        const priceData = {
          product_id: productId,
          supplier_id: supplierId,
          unit_price: parseFloat(formData.unit_price),
          vat_rate: parseFloat(formData.vat_rate)
        }

        const { data: existing, error: queryError } = await supabase
          .from('supplier_products')
          .select('id')
          .eq('product_id', productId)
          .eq('supplier_id', supplierId)
          .single()

        if (existing && !queryError) {
          await api.update('supplier_products', existing.id, priceData)
        } else {
          await api.create('supplier_products', priceData)
        }
      }

      alert('✅ Produit enregistré avec succès !')
      await onSuccess()
    } catch (err) {
      console.error('Erreur:', err)
      alert('❌ Erreur lors de l\'enregistrement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {product ? '✏️ Modifier' : '➕ Ajouter'} un produit
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Photo du produit
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition overflow-hidden bg-gray-50"
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <Package size={48} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">Cliquer pour ajouter une photo</p>
                  <p className="text-xs mt-1">JPG, PNG, WebP (max 5MB)</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {imagePreview && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setImageFile(null)
                  setImagePreview('')
                  setFormData({ ...formData, image_url: '' })
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                🗑️ Supprimer l'image
              </button>
            )}
          </div>

          {/* Nom du produit */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Nom du produit *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 placeholder:text-gray-500"
              placeholder="Ex: Bifteck de bœuf"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Catégorie *
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900"
            >
              <option value="">-- Sélectionner une catégorie --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Prix et TVA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Prix HT *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 placeholder:text-gray-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                TVA (%)
              </label>
              <select
                value={formData.vat_rate}
                onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900"
              >
                <option value="6">6%</option>
                <option value="12">12%</option>
                <option value="21">21%</option>
              </select>
            </div>
          </div>

          {/* Conditionnement */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Conditionnement / Emballage
            </label>
            <input
              type="text"
              value={formData.packaging_info}
              onChange={(e) => setFormData({ ...formData, packaging_info: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 placeholder:text-gray-500"
              placeholder="Ex: Carton de 10kg, Sachet de 500g..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none text-gray-900 placeholder:text-gray-500"
              placeholder="Description détaillée du produit..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Notes internes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none text-gray-900 placeholder:text-gray-500"
              placeholder="Notes pour usage interne..."
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              disabled={loading || uploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || uploading}
            >
              {uploading ? '📤 Upload...' : loading ? '⏳ Enregistrement...' : (product ? '✅ Modifier' : '✅ Créer')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}