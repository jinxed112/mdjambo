'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Power, PowerOff, X, Mail, User as UserIcon, Lock, Key } from 'lucide-react'
import { api, auth } from '@/lib/api'

type AdminUser = {
  id: string
  email: string
  full_name: string
  is_active: boolean
  created_at: string
  last_login: string | null
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('')
  const [isMainAdmin, setIsMainAdmin] = useState(false)

  useEffect(() => {
    // Récupérer l'email de l'utilisateur connecté
    const session = auth.getSession()
    if (session) {
      setCurrentUserEmail(session.email)
      // Vérifier si c'est l'admin principal
      setIsMainAdmin(session.email === 'admin@mdjambo.be' || session.email === 'matteo@mdjambo.be')
    }
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await api.callRPC('get_all_admin_users', {})
      setUsers(data)
    } catch (err) {
      console.error('Erreur:', err)
      alert('❌ Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    const action = isActive ? 'deactivate_admin_user' : 'activate_admin_user'
    const confirmMsg = isActive 
      ? 'Désactiver cet utilisateur ?' 
      : 'Réactiver cet utilisateur ?'

    if (!confirm(confirmMsg)) return

    try {
      await api.callRPC(action, { p_user_id: userId })
      alert('✅ Utilisateur mis à jour')
      loadUsers()
    } catch (err) {
      console.error('Erreur:', err)
      alert('❌ Erreur lors de la mise à jour')
    }
  }

  const handleOpenResetModal = (user: AdminUser) => {
    if (!isMainAdmin) {
      alert('❌ Seul l\'administrateur principal peut réinitialiser les mots de passe')
      return
    }
    setSelectedUser(user)
    setShowResetModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-3">
              <Users size={32} className="text-blue-600" />
              Gestion des utilisateurs
            </h1>
            <p className="text-gray-600">
              {users.filter(u => u.is_active).length} utilisateur(s) actif(s)
              {isMainAdmin && <span className="ml-2 text-green-600 font-semibold">• Admin Principal</span>}
            </p>
          </div>
          {isMainAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              Nouvel utilisateur
            </button>
          )}
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold">Nom</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Dernière connexion</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Créé le</th>
                <th className="px-6 py-4 text-left text-sm font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b hover:bg-blue-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{user.full_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600">
                      {user.email}
                      {user.email === currentUserEmail && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Vous
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        <Power size={14} />
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                        <PowerOff size={14} />
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleString('fr-BE')
                      : 'Jamais'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('fr-BE')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(user.id, user.is_active)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          user.is_active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      
                      {/* Bouton réinitialiser mot de passe - SEULEMENT pour l'admin */}
                      {isMainAdmin && user.email !== currentUserEmail && (
                        <button
                          onClick={() => handleOpenResetModal(user)}
                          className="px-4 py-2 rounded-lg font-semibold transition bg-orange-100 text-orange-700 hover:bg-orange-200 flex items-center gap-2"
                          title="Réinitialiser le mot de passe"
                        >
                          <Key size={16} />
                          MDP
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout Utilisateur */}
      {showAddModal && isMainAdmin && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadUsers()
          }}
        />
      )}

      {/* Modal Réinitialisation Mot de Passe */}
      {showResetModal && selectedUser && isMainAdmin && (
        <ResetPasswordModal
          user={selectedUser}
          requesterEmail={currentUserEmail}
          onClose={() => {
            setShowResetModal(false)
            setSelectedUser(null)
          }}
          onSuccess={() => {
            setShowResetModal(false)
            setSelectedUser(null)
            alert('✅ Mot de passe réinitialisé avec succès !')
          }}
        />
      )}
    </div>
  )
}

// Modal d'ajout d'utilisateur
function AddUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.callRPC('create_admin_user', {
        p_email: formData.email,
        p_password: formData.password,
        p_full_name: formData.fullName
      })

      alert('✅ Utilisateur créé avec succès !')
      onSuccess()
    } catch (err) {
      console.error('Erreur:', err)
      alert('❌ ' + (err instanceof Error ? err.message : 'Erreur'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-50 rounded-2xl shadow-2xl">
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-xl font-bold">Nouvel utilisateur</h2>
          <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nom complet *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Jean Dupont"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500"
                placeholder="jean@mdjambo.be"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Min. 8 caractères"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 caractères recommandés
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer l\'utilisateur'}
          </button>
        </form>
      </div>
    </>
  )
}

// Modal de réinitialisation de mot de passe
function ResetPasswordModal({ 
  user, 
  requesterEmail, 
  onClose, 
  onSuccess 
}: { 
  user: AdminUser
  requesterEmail: string
  onClose: () => void
  onSuccess: () => void 
}) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert('❌ Les mots de passe ne correspondent pas')
      return
    }

    if (newPassword.length < 8) {
      alert('❌ Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (!confirm(`Réinitialiser le mot de passe de ${user.full_name} ?`)) {
      return
    }

    setLoading(true)

    try {
      await api.callRPC('reset_admin_user_password', {
        p_user_id: user.id,
        p_new_password: newPassword,
        p_requester_email: requesterEmail
      })

      onSuccess()
    } catch (err) {
      console.error('Erreur:', err)
      alert('❌ ' + (err instanceof Error ? err.message : 'Erreur'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white z-50 rounded-2xl shadow-2xl">
        <div className="bg-orange-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Key size={24} />
            Réinitialiser le mot de passe
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-orange-700 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900">
              <strong>Utilisateur :</strong> {user.full_name}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Email :</strong> {user.email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nouveau mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Minimum 8 caractères"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Répétez le mot de passe"
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              ⚠️ L'utilisateur devra utiliser ce nouveau mot de passe dès sa prochaine connexion.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-orange-700 transition disabled:opacity-50"
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
      </div>
    </>
  )
}