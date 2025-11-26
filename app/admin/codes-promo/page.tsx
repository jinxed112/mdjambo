'use client'

import { useState, useEffect } from 'react'
import { partnersAPI, type Referral, type Partner } from '@/lib/partners-api'
import { Download, Check, X, Search, Calendar, Mail, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CodesPromoPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unused' | 'used'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [partnersData] = await Promise.all([
        partnersAPI.getPartners()
      ])
      
      setPartners(partnersData)
      
      // Charger tous les referrals de tous les partenaires
      const allReferrals: Referral[] = []
      for (const partner of partnersData) {
        const partnerReferrals = await partnersAPI.getReferralsByPartner(partner.id)
        allReferrals.push(...partnerReferrals)
      }
      
      setReferrals(allReferrals)
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const getPartnerName = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId)
    return partner?.name || 'Inconnu'
  }

  const filteredReferrals = referrals.filter(ref => {
    // Filtre par statut
    if (filter === 'unused' && ref.is_used) return false
    if (filter === 'used' && !ref.is_used) return false
    
    // Filtre par recherche
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        ref.promo_code.toLowerCase().includes(search) ||
        ref.user_email.toLowerCase().includes(search) ||
        ref.user_name?.toLowerCase().includes(search) ||
        getPartnerName(ref.partner_id).toLowerCase().includes(search)
      )
    }
    
    return true
  })

  const exportToCSV = () => {
    const csvContent = [
      ['Code Promo', 'Client', 'Email', 'Partenaire', 'Réduction', 'Utilisé', 'Date création'].join(';'),
      ...filteredReferrals.map(ref => [
        ref.promo_code,
        ref.user_name || '',
        ref.user_email,
        getPartnerName(ref.partner_id),
        `${ref.discount_percentage}%`,
        ref.is_used ? 'Oui' : 'Non',
        new Date(ref.created_at).toLocaleDateString('fr-BE')
      ].join(';'))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `codes-promo-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    toast.success('Export CSV téléchargé !')
  }

  const exportForRestoMax = () => {
    // Format spécifique pour RestoMax : CODE;REDUCTION;TYPE;USAGE_UNIQUE
    const csvContent = [
      ['CODE_PROMO', 'REDUCTION', 'TYPE', 'USAGE_UNIQUE'].join(';'),
      ...filteredReferrals
        .filter(ref => !ref.restomax_synced && !ref.is_used)
        .map(ref => [
          ref.promo_code,
          ref.discount_percentage,
          'POURCENTAGE',
          'OUI'
        ].join(';'))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `restomax-import-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    toast.success('Export RestoMax téléchargé !')
  }

  const markAsSynced = async () => {
    const unsyncedIds = filteredReferrals
      .filter(ref => !ref.restomax_synced && !ref.is_used)
      .map(ref => ref.id)

    if (unsyncedIds.length === 0) {
      toast.error('Aucun code à synchroniser')
      return
    }

    try {
      await partnersAPI.markReferralsAsSynced(unsyncedIds)
      toast.success(`${unsyncedIds.length} codes marqués comme synchronisés`)
      loadData()
    } catch (error) {
      toast.error('Erreur lors de la synchronisation')
    }
  }

  const stats = {
    total: referrals.length,
    unused: referrals.filter(r => !r.is_used).length,
    used: referrals.filter(r => r.is_used).length,
    notSynced: referrals.filter(r => !r.restomax_synced && !r.is_used).length
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Codes Promo Générés</h1>
        <p className="text-gray-600 mt-1">Gérez et exportez les codes pour RestoMax</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Non utilisés</div>
          <div className="text-2xl font-bold text-green-600">{stats.unused}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Utilisés</div>
          <div className="text-2xl font-bold text-blue-600">{stats.used}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">À synchroniser</div>
          <div className="text-2xl font-bold text-orange-600">{stats.notSynced}</div>
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Recherche */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un code, email, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('unused')}
              className={`px-4 py-2 rounded-lg ${filter === 'unused' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Non utilisés
            </button>
            <button
              onClick={() => setFilter('used')}
              className={`px-4 py-2 rounded-lg ${filter === 'used' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Utilisés
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={exportForRestoMax}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download size={18} />
              RestoMax
            </button>
            {stats.notSynced > 0 && (
              <button
                onClick={markAsSynced}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
              >
                <Check size={18} />
                Marquer synchronisé
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des codes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code Promo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partenaire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réduction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredReferrals.map((referral) => (
              <tr key={referral.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm font-bold">
                    {referral.promo_code}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{referral.user_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail size={12} />
                        {referral.user_email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {getPartnerName(referral.partner_id)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    -{referral.discount_percentage}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(referral.created_at).toLocaleDateString('fr-BE')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {referral.is_used ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Check size={12} className="mr-1" />
                        Utilisé
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Actif
                      </span>
                    )}
                    {!referral.restomax_synced && !referral.is_used && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        À synchroniser
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReferrals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun code promo trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
