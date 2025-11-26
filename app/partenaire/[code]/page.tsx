'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { partnersAPI, type Partner } from '@/lib/partners-api'
import { Gift, Mail, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PartenairePage() {
  const params = useParams()
  const code = params.code as string

  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [alreadyExists, setAlreadyExists] = useState(false)
  const [errors, setErrors] = useState<{name?: string, email?: string}>({})

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })

  useEffect(() => {
    loadPartner()
  }, [code])

  const loadPartner = async () => {
    try {
      setLoading(true)
      const data = await partnersAPI.getPartnerByCode(code)
      setPartner(data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: {name?: string, email?: string} = {}

    // Validation nom
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères'
    }

    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs')
      return
    }

    try {
      setSubmitting(true)
      const result = await partnersAPI.createReferral(
        code,
        formData.email.toLowerCase().trim(),
        formData.name.trim()
      )

      if (result.success) {
        setPromoCode(result.promo_code)
        setAlreadyExists(result.already_exists || false)
        
        if (result.already_exists) {
          toast.success('Votre code promo existant a été récupéré')
        } else {
          toast.success('Code promo généré avec succès !')
        }
      } else {
        toast.error(result.error || 'Erreur lors de la génération du code')
      }
    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error(error.message || 'Erreur lors de la génération du code promo')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-red-600" />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Partenaire introuvable</h1>
          <p className="text-gray-600">Ce lien n'est pas valide ou le partenaire n'est plus actif.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-red-600">MDjambo</h1>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {!promoCode ? (
          // Formulaire
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header avec logo partenaire */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-white text-center">
              {partner.logo_url && (
                <img 
                  src={partner.logo_url} 
                  alt={partner.name}
                  className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-2 object-contain"
                />
              )}
              <h2 className="text-3xl font-bold mb-2">{partner.name}</h2>
              <p className="text-red-100 text-lg">vous offre une réduction exclusive !</p>
            </div>

            {/* Description */}
            <div className="p-8">
              {partner.custom_message ? (
                <div className="mb-6 text-gray-700 text-center text-lg">
                  {partner.custom_message}
                </div>
              ) : (
                <div className="mb-6 text-gray-700 text-center text-lg">
                  Profitez d'une réduction de <span className="font-bold text-red-600">10%</span> sur votre première commande chez MDjambo !
                </div>
              )}

              {/* Avantages */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Gift className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-semibold">10% de réduction</p>
                  <p className="text-sm text-gray-600">Sur votre commande</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-semibold">Code immédiat</p>
                  <p className="text-sm text-gray-600">Pas d'attente</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <User className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-semibold">Simple & Rapide</p>
                  <p className="text-sm text-gray-600">En 30 secondes</p>
                </div>
              </div>

              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-red-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition"
                >
                  Obtenir ma réduction de 10%
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Votre nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        setErrors({ ...errors, name: undefined })
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Jean Dupont"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Votre email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        setErrors({ ...errors, email: undefined })
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="jean.dupont@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Info importante */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 flex items-start gap-2">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Limite :</strong> 1 code par partenaire maximum et 3 codes au total.
                      </span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-red-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Génération en cours...
                      </>
                    ) : (
                      'Obtenir mon code promo'
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Vos données sont uniquement utilisées pour générer votre code promo
                  </p>
                </form>
              )}
            </div>
          </div>
        ) : (
          // Affichage du code promo
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-center p-8">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {alreadyExists ? 'Votre code existant' : 'Félicitations !'}
              </h2>
              <p className="text-gray-600">
                {alreadyExists 
                  ? 'Vous aviez déjà un code pour ce partenaire' 
                  : 'Votre code promo a été généré avec succès'}
              </p>
            </div>

            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-8 mb-6">
              <p className="text-white text-sm mb-2">Votre code promo :</p>
              <p className="text-white text-4xl font-bold tracking-wider">{promoCode}</p>
            </div>

            <div className="space-y-4 text-left bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900">Comment utiliser votre code :</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Présentez ce code lors de votre commande chez MDjambo</li>
                <li>Profitez de 10% de réduction sur votre commande</li>
                <li>Le code est valable une seule fois</li>
              </ol>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                📧 Notez bien ce code ! Vous pouvez faire une capture d'écran.
              </p>
            </div>

            <div className="mt-8">
              <a 
                href="/"
                className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Découvrir MDjambo
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600">
        <p className="text-sm">
          Une offre proposée par {partner.name} en partenariat avec MDjambo
        </p>
      </footer>
    </div>
  )
}
