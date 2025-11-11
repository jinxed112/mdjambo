import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4 text-yellow-400">MDjambo</h4>
            <p className="text-gray-400">
              Philly Cheese Steak & Smash burgers près de Pairi Daiza
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Liens rapides</h4>
            <div className="flex flex-col gap-2">
              <Link href="/#menu" className="text-gray-400 hover:text-white">Menu</Link>
              <Link href="/#location" className="text-gray-400 hover:text-white">Contact</Link>
              <Link href="/admin" className="text-gray-400 hover:text-white">Espace Admin</Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Suivez-nous</h4>
            <div className="flex flex-col gap-2">
              <a href="https://www.facebook.com/share/1UQrzK91XM/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Facebook</a>
              <a href="https://www.instagram.com/mdjambo_snack" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">Instagram</a>
              <a href="https://www.tiktok.com/@mdjambo.friterie" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">TikTok</a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Horaires</h4>
            <p className="text-gray-400 text-sm">
              Lun-Jeu : 18h-21h<br/>
              Ven-Sam : 18h-21h30<br/>
              Dim : 18h-21h
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          © 2025 MDjambo. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
