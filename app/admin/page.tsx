'use client'

import Link from 'next/link'
import { ShoppingCart, Users, Package } from 'lucide-react'

export default function AdminDashboard() {
  const quickActions = [
    {
      title: 'Nouvelle commande',
      description: 'Créer une commande fournisseur',
      href: '/admin/commandes',
      icon: ShoppingCart,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Gérer les utilisateurs',
      description: 'Ajouter ou modifier des utilisateurs',
      href: '/admin/users',
      icon: Users,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Voir les produits',
      description: 'Gérer le catalogue produits',
      href: '/admin/commandes',
      icon: Package,
      color: 'bg-green-600 hover:bg-green-700'
    }
  ]

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Tableau de bord 📊
        </h1>
        <p className="text-gray-600 text-lg">
          Bienvenue sur MDjambo Admin
        </p>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                href={action.href}
                className={`${action.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:scale-105`}
              >
                <Icon size={32} className="mb-4" />
                <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                <p className="text-white/90">{action.description}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          💡 Bienvenue sur le nouveau portail !
        </h3>
        <p className="text-gray-700">
          Toutes tes fonctionnalités sont accessibles via le menu ci-dessus. Commence par créer une commande fournisseur ou gérer les utilisateurs.
        </p>
      </div>
    </div>
  )
}