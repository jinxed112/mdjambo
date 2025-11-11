// lib/api.ts - Centralisation des appels API
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const api = {
  // Helper pour les appels RPC
  async callRPC(functionName: string, params: any = {}) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${functionName}`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || `Erreur API: ${response.status}`)
    }

    return response.json()
  },

  // Helper pour les requêtes REST
  async query(table: string, options: {
    select?: string
    filter?: Record<string, any>
    order?: { column: string, ascending?: boolean }
    limit?: number
  } = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}`
    const params = new URLSearchParams()
    
    if (options.select) params.append('select', options.select)
    if (options.limit) params.append('limit', options.limit.toString())
    if (options.order) {
      params.append('order', `${options.order.column}.${options.order.ascending ? 'asc' : 'desc'}`)
    }
    if (options.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        params.append(key, `eq.${value}`)
      })
    }

    if (params.toString()) url += `?${params.toString()}`

    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`)
    }

    return response.json()
  },

  // Helper pour les UPDATE
  async update(table: string, id: string, data: any) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }

    return true
  },

  // Upload d'image vers Supabase Storage
  async uploadImage(file: File, bucket: string = 'product-images'): Promise<string> {
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': file.type
        },
        body: file
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Erreur upload')
    }

    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`
  }
}

// Auth helpers
export const auth = {
  getSession() {
    if (typeof window === 'undefined') return null
    const session = localStorage.getItem('admin_session')
    return session ? JSON.parse(session) : null
  },

  setSession(user: any) {
    localStorage.setItem('admin_session', JSON.stringify(user))
  },

  clearSession() {
    localStorage.removeItem('admin_session')
  },

  async login(email: string, password: string) {
    const data = await api.callRPC('verify_admin_login', {
      p_email: email,
      p_password: password
    })

    if (!data || data.length === 0) {
      throw new Error('Email ou mot de passe incorrect')
    }

    const user = data[0]
    this.setSession({
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      logged_in_at: new Date().toISOString()
    })

    return user
  }
}
