'use client'

import { useState, useEffect } from 'react'
import { partnersAPI, type Partner, type PartnerStats } from '@/lib/partners-api'
import { Users, Plus, Edit2, Trash2, Copy, BarChart3, Upload, X, Check, Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PartenairesPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [stats, setStats] = useState<PartnerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    legal_name: '',
    description: '',
    custom_message: '',
    logo_url: '',
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [partnersData, statsData] = await Promise.all([
        partnersAPI.getPartners(),
        partnersAPI.getPartnerStats()
      ])
      setPartners(partnersData)
      setStats(statsData)
    } catch (error) {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      code: partnersAPI.generateUrlCode(name)
    })
  }

  const handleLogoUpload = async () => {
    if (!logoFile || !formData.code) {
      toast.error('Veuillez remplir le nom avant d\'uploader le logo')
      return
    }

    try {
      setUploading(true)
      const logoUrl = await partnersAPI.uploadLogo(logoFile, formData.code)
      setFormData({ ...formData, logo_url: logoUrl })
      toast.success('Logo uploadé !')
    } catch (error) {
      toast.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPartner) {
        await partnersAPI.updatePartner(editingPartner.id, formData)
        toast.success('Partenaire modifié !')
      } else {
        await partnersAPI.createPartner(formData as any)
        toast.success('Partenaire créé !')
      }
      
      setShowModal(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner)
    setFormData({
      name: partner.name,
      code: partner.code,
      email: partner.email,
      phone: partner.phone || '',
      legal_name: partner.legal_name || '',
      description: partner.description || '',
      custom_message: partner.custom_message || '',
      logo_url: partner.logo_url || '',
      is_active: partner.is_active
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce partenaire ?')) return

    try {
      await partnersAPI.deletePartner(id)
      toast.success('Partenaire supprimé')
      loadData()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/partenaire/${code}`
    navigator.clipboard.writeText(url)
    toast.success('Lien copié !')
  }

  const resetForm = () => {
    setEditingPartner(null)
    setLogoFile(null)
    setFormData({
      name: '',
      code: '',
      email: '',
      phone: '',
      legal_name: '',
      description: '',
      custom_message: '',
      logo_url: '',
      is_active: true
    })
  }

  const getStatsForPartner = (partnerId: string) => {
    return stats.find(s => s.id === partnerId)
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Partenaires</h1>
          <p className="text-gray-600 mt-1">Créez et gérez vos partenaires de parrainage</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nouveau Partenaire
        </button>
      </div>

      {/* Liste des partenaires */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {partners.map((partner) => {
              const partnerStats = getStatsForPartner(partner.id)
              return (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt={partner.name} className="w-12 h-12 object-contain" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Users size={24} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{partner.name}</div>
                    {partner.legal_name && (
                      <div className="text-sm text-gray-500">{partner.legal_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{partner.code}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{partner.email}</td>
                  <td className="px-6 py-4">
                    {partnerStats && (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {partnerStats.total_referrals} parrainages
                        </div>
                        <div className="text-gray-500">
                          {partnerStats.used_referrals} utilisés
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {partner.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => copyLink(partner.code)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Copier le lien"
                    >
                      <LinkIcon size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(partner)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Modifier"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {partners.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun partenaire</h3>
            <p className="text-gray-500">Créez votre premier partenaire pour commencer</p>
          </div>
        )}
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du partenaire *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Ex: Coiffure Bella"
                />
              </div>

              {/* Code URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 font-mono"
                  placeholder="bella-coiffure"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: {window.location.origin}/partenaire/{formData.code || '...'}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="contact@bella-coiffure.be"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="+32 123 45 67 89"
                />
              </div>

              {/* Raison sociale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison sociale
                </label>
                <input
                  type="text"
                  value={formData.legal_name}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Bella Coiffure SPRL"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleLogoUpload}
                    disabled={!logoFile || uploading}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? 'Upload...' : <><Upload size={18} /> Upload</>}
                  </button>
                </div>
                {formData.logo_url && (
                  <img src={formData.logo_url} alt="Logo" className="mt-2 w-24 h-24 object-contain border rounded" />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Courte description du partenaire..."
                />
              </div>

              {/* Message personnalisé */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message personnalisé
                </label>
                <textarea
                  value={formData.custom_message}
                  onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Message affiché sur la page du partenaire..."
                />
              </div>

              {/* Statut */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Partenaire actif
                </label>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  {editingPartner ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
