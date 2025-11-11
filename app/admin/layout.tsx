'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Users, ShoppingCart, Package } from 'lucide-react'
import { auth } from '@/lib/api'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const session = auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setCurrentUser(session)
  }, [router])

  const handleLogout = () => {
    if (confirm('Se déconnecter ?')) {
      auth.clearSession()
      router.push('/login')
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header Admin */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-2xl font-bold text-red-600">
                MDjambo
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link 
                  href="/admin" 
                  className={`flex items-center gap-2 font-medium transition ${
                    pathname === '/admin' 
                      ? 'text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Package size={18} />
                  Tableau de bord
                </Link>
                <Link 
                  href="/admin/commandes" 
                  className={`flex items-center gap-2 font-medium transition ${
                    pathname === '/admin/commandes' 
                      ? 'text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <ShoppingCart size={18} />
                  Commandes
                </Link>
                <Link 
                  href="/admin/users" 
                  className={`flex items-center gap-2 font-medium transition ${
                    pathname === '/admin/users' 
                      ? 'text-blue-600' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <Users size={18} />
                  Utilisateurs
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-600">Connecté en tant que</p>
                <p className="font-semibold text-gray-900">{currentUser.full_name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                <LogOut size={18} />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
