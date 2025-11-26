'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'
import { LogIn, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <nav className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="text-2xl font-bold text-red-600">MDjambo</div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#menu" className="hover:text-red-600 transition font-medium">
            Menu
          </Link>
          <Link href="/allergenes" className="hover:text-red-600 transition font-medium">
            Allergènes
          </Link>
          <Link href="/#location" className="hover:text-red-600 transition font-medium">
            Contact
          </Link>

          {user ? (
            <>
              <Link
                href="/admin"
                className="hover:text-red-600 transition flex items-center gap-2 font-medium"
              >
                <LayoutDashboard size={18} />
                Admin
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition font-medium"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 transition font-medium"
              title="Accès personnel uniquement"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">Personnel</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="flex flex-col p-4 gap-4">
            <Link
              href="/#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium"
            >
              Menu
            </Link>
            <Link
              href="/allergenes"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium"
            >
              Allergènes
            </Link>
            <Link
              href="/#location"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium"
            >
              Contact
            </Link>

            {user ? (
              <>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-medium"
                >
                  Admin
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="text-left font-medium"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="font-medium"
              >
                Connexion Personnel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}