'use client'

import { X, MessageCircle, Phone, Clock, CheckCircle } from 'lucide-react'

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Réserver une table</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={28} />
            </button>
          </div>

          {/* Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={40} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Réservez via Messenger
            </h3>
            <p className="text-gray-600">
              Contactez-nous directement pour réserver votre table
            </p>
          </div>

          {/* Info */}
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Réponse rapide garantie</p>
                  <p className="text-sm text-gray-600">
                    Notre équipe vous répond généralement en moins de 30 minutes
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="text-green-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Horaires de réservation</p>
                  <p className="text-sm text-gray-600">
                    Lun-Jeu : 18h-21h | Ven-Sam : 18h-21h30 | Dim : 18h-21h
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Phone className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Ou par téléphone</p>
                  <p className="text-sm text-gray-600">
                    Appelez-nous au <strong>0497 75 35 54</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <a
              href="https://m.me/1UQrzK91XM"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-3 shadow-lg"
            >
              <MessageCircle size={24} />
              Ouvrir Messenger
            </a>

            <a
              href="tel:+32497753554"
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-3"
            >
              <Phone size={20} />
              Appeler maintenant
            </a>

            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Fermer
            </button>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            💡 Astuce : Mentionnez la date, l'heure et le nombre de personnes dans votre message
          </p>
        </div>
      </div>
    </div>
  )
}