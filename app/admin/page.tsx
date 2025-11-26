'use client'

import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Plus, Search, Grid3x3, List, GripVertical, Download, Edit2, Trash2, Package, Move, RotateCcw, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
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

type CartItem = Product & {
  quantity: number
}

type Supplier = {
  id: string
  name: string
  city: string
  phone: string
}

export default function AdminPage() {
  return (
    <div className="p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard Admin</h1>
        <p className="text-gray-600">Bienvenue sur votre tableau de bord</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <a href="/admin/commandes" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <ShoppingCart className="text-blue-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Commandes Fournisseurs</h2>
          <p className="text-gray-600">Gérer vos commandes</p>
        </a>

        <a href="/admin/analyse-ventes" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <Package className="text-green-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Analyse des Ventes</h2>
          <p className="text-gray-600">Analyser et calculer les besoins</p>
        </a>

        <a href="/admin/partenaires" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <Plus className="text-orange-600 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Partenaires</h2>
          <p className="text-gray-600">Gérer les partenariats</p>
        </a>
      </div>
    </div>
  )
}
