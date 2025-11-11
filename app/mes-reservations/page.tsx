'use client'

import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Users, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface Reservation {
  id: string
  user_name: string
  user_email: string
  user_phone: string
  reservation_date: string
  reservation_time: string
  number_of_people: number
  special_requests: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

export default function MesReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)
      loadReservations(user.id)
    }
    checkAuth()
  }, [])

  const loadReservations = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', userId)
        .order('reservation_date', { ascending: false })

      if (error) throw error
      setReservations(data || [])
    } catch (error: any) {
      toast.error('Erreur lors du chargement des réservations')
    } finally {
      setLoading(false)
    }
  }

  const cancelReservation = async (id: string) => {
    if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id)

      if (error) throw error

      toast.success('Réservation annulée')
      if (user) loadReservations(user.id)
    } catch (error: any) {
      toast.error('Erreur lors de l\'annulation')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle size={16} />
            Confirmée
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle size={16} />
            Annulée
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle size={16} />
            En attente
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Mes Réservations
        </h1>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Aucune réservation
            </h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore de réservation
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition"
            >
              Réserver une table
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {reservation.user_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Réservé le {format(new Date(reservation.created_at), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={18} className="text-red-600" />
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="font-semibold">
                        {format(new Date(reservation.reservation_date), 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock size={18} className="text-red-600" />
                    <div>
                      <div className="text-xs text-gray-500">Heure</div>
                      <div className="font-semibold">{reservation.reservation_time}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Users size={18} className="text-red-600" />
                    <div>
                      <div className="text-xs text-gray-500">Personnes</div>
                      <div className="font-semibold">{reservation.number_of_people}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <MessageSquare size={18} className="text-red-600" />
                    <div>
                      <div className="text-xs text-gray-500">Contact</div>
                      <div className="font-semibold text-xs">{reservation.user_phone}</div>
                    </div>
                  </div>
                </div>

                {reservation.special_requests && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700">
                      <strong>Demandes spéciales:</strong> {reservation.special_requests}
                    </p>
                  </div>
                )}

                {reservation.status === 'pending' && (
                  <button
                    onClick={() => cancelReservation(reservation.id)}
                    className="w-full sm:w-auto bg-red-100 text-red-700 px-6 py-2 rounded-lg font-semibold hover:bg-red-200 transition"
                  >
                    Annuler la réservation
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
