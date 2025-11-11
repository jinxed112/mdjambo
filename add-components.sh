#!/bin/bash

# 🚀 Script pour ajouter les composants manquants
# À exécuter DANS le dossier mdjambo-website

echo "📝 Ajout des composants manquants..."
echo ""

# ===== COMPONENTS/RESERVATIONMODAL.TSX =====
echo "✍️ Création components/ReservationModal.tsx..."
cat > components/ReservationModal.tsx << 'EOFMODAL'
'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { X, Calendar, Clock, Users, Phone, Mail, User, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, addDays, startOfToday } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ReservationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const supabase = createSupabaseClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    people: 2,
    requests: ''
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || '',
          email: user.email || ''
        }))
      }
    }
    getUser()
  }, [])

  const timeSlots = [
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ]

  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(startOfToday(), i + 1)
    return format(date, 'yyyy-MM-dd')
  })

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      toast.error('Erreur de connexion')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Veuillez vous connecter avec Google')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert({
          user_id: user.id,
          user_name: formData.name,
          user_email: formData.email,
          user_phone: formData.phone,
          reservation_date: formData.date,
          reservation_time: formData.time,
          number_of_people: formData.people,
          special_requests: formData.requests || null,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Réservation créée ! Nous vous confirmons rapidement.')
      
      setFormData({
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: '',
        date: '',
        time: '',
        people: 2,
        requests: ''
      })
      
      onClose()
      router.push('/mes-reservations')
      
    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la réservation')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-500 text-white p-6 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Réserver une table</h2>
            <p className="text-sm opacity-90">MDjambo - Jurbise</p>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!user ? (
            <div className="text-center py-8">
              <div className="mb-6">
                <User size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Connexion requise</h3>
                <p className="text-gray-600">
                  Pour réserver, connectez-vous avec votre compte Google
                </p>
              </div>
              <button
                onClick={handleGoogleLogin}
                className="bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-50 transition inline-flex items-center gap-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <User size={18} className="text-red-600" />
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Mail size={18} className="text-red-600" />
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition bg-gray-50"
                  placeholder="votre@email.com"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Phone size={18} className="text-red-600" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition"
                  placeholder="0497 xx xx xx"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Calendar size={18} className="text-red-600" />
                    Date
                  </label>
                  <select
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition"
                  >
                    <option value="">Choisir...</option>
                    {availableDates.map(date => (
                      <option key={date} value={date}>
                        {format(new Date(date), 'EEE d MMM', { locale: fr })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Clock size={18} className="text-red-600" />
                    Heure
                  </label>
                  <select
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition"
                  >
                    <option value="">Choisir...</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Users size={18} className="text-red-600" />
                  Nombre de personnes
                </label>
                <select
                  required
                  value={formData.people}
                  onChange={(e) => setFormData({ ...formData, people: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'personne' : 'personnes'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare size={18} className="text-red-600" />
                  Demandes spéciales (optionnel)
                </label>
                <textarea
                  value={formData.requests}
                  onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition resize-none"
                  rows={3}
                  placeholder="Allergie, chaise bébé, occasion spéciale..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Réservation en cours...' : 'Confirmer ma réservation'}
              </button>

              <p className="text-sm text-gray-500 text-center">
                Vous recevrez une confirmation par email dans les 24h
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
EOFMODAL

echo "✅ ReservationModal.tsx créé"

# ===== COMPONENTS/BLOGSECTION.TSX =====
echo "✍️ Création components/BlogSection.tsx..."
cat > components/BlogSection.tsx << 'EOFBLOG'
'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient, type FacebookPost } from '@/lib/supabase'
import { Heart, MessageCircle, Share2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function BlogSection() {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('facebook_posts')
          .select('*')
          .eq('is_published', true)
          .order('created_time', { ascending: false })
          .limit(6)

        if (error) throw error
        setPosts(data || [])
      } catch (error) {
        console.error('Erreur chargement posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Nos Dernières Actualités</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="bg-gray-200 h-64"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (posts.length === 0) {
    return (
      <section className="py-20 bg-gray-50" id="blog">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Nos Dernières Actualités</h2>
          <p className="text-gray-600 mb-8">
            Aucune publication pour le moment. Suivez-nous sur Facebook !
          </p>
          <a
            href="https://www.facebook.com/share/1UQrzK91XM/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition"
          >
            Suivre sur Facebook
            <ExternalLink size={18} />
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50" id="blog">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Nos Dernières Actualités</h2>
          <p className="text-gray-600 text-lg">
            Découvrez nos nouveautés et coulisses sur Facebook
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition group"
            >
              {post.full_picture && (
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={post.full_picture}
                    alt="Post MDjambo"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="text-sm text-gray-500 mb-3">
                  {format(new Date(post.created_time), "d MMMM yyyy", { locale: fr })}
                </div>

                {post.message && (
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {post.message}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Heart size={16} className="text-red-500" />
                      {post.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={16} className="text-blue-500" />
                      {post.comments_count}
                    </span>
                  </div>

                  {post.permalink_url && (
                    <a
                      href={post.permalink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                    >
                      Voir plus
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.facebook.com/share/1UQrzK91XM/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-red-700 hover:to-orange-600 transition shadow-lg"
          >
            Suivre MDjambo sur Facebook
            <ExternalLink size={20} />
          </a>
        </div>
      </div>
    </section>
  )
}
EOFBLOG

echo "✅ BlogSection.tsx créé"

echo ""
echo "✅ =========================================="
echo "✅ TOUS LES COMPOSANTS ONT ÉTÉ CRÉÉS !"
echo "✅ =========================================="
echo ""
echo "📋 Fichiers créés :"
echo "   ✅ components/ReservationModal.tsx"
echo "   ✅ components/BlogSection.tsx"
echo ""
echo "🔧 Reste à faire :"
echo "   1️⃣  Créer app/page.tsx (page d'accueil)"
echo "   2️⃣  Créer app/admin/page.tsx (dashboard)"
echo "   3️⃣  Copier les images dans public/images/"
echo "   4️⃣  npm run dev"
echo ""
echo "💡 Tu veux que je crée app/page.tsx et app/admin/page.tsx aussi ?"
echo ""