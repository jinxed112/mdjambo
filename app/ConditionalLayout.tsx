'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Vérifier si on est dans la zone admin ou login
  const isAdminArea = pathname?.startsWith('/admin') || pathname?.startsWith('/login')

  // Si on est dans l'admin, afficher seulement les enfants (pas de Header/Footer)
  if (isAdminArea) {
    return <>{children}</>
  }

  // Sinon, afficher le layout complet avec Header et Footer
  return (
    <>
      <Header />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </>
  )
}