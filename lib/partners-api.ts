import { createSupabaseClient } from './supabase'

export type Partner = {
  id: string
  code: string
  name: string
  legal_name?: string
  email: string
  phone?: string
  logo_url?: string
  description?: string
  custom_message?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Referral = {
  id: string
  partner_id: string
  user_email: string
  user_name?: string
  promo_code: string
  discount_percentage: number
  is_used: boolean
  used_at?: string
  restomax_synced: boolean
  synced_at?: string
  created_at: string
}

export type PartnerStats = {
  id: string
  code: string
  name: string
  total_referrals: number
  used_referrals: number
  pending_referrals: number
  last_referral_date?: string
}

class PartnersAPI {
  private supabase = createSupabaseClient()

  // ============================================
  // GESTION DES PARTENAIRES
  // ============================================

  async getPartners(activeOnly = false): Promise<Partner[]> {
    try {
      let query = this.supabase
        .from('partners')
        .select('*')
        .order('name')

      if (activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur getPartners:', error)
      throw error
    }
  }

  async getPartnerByCode(code: string): Promise<Partner | null> {
    try {
      const { data, error } = await this.supabase
        .from('partners')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur getPartnerByCode:', error)
      return null
    }
  }

  async createPartner(partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<Partner> {
    try {
      const { data, error } = await this.supabase
        .from('partners')
        .insert([partner])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur createPartner:', error)
      throw error
    }
  }

  async updatePartner(id: string, updates: Partial<Partner>): Promise<Partner> {
    try {
      const { data, error } = await this.supabase
        .from('partners')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur updatePartner:', error)
      throw error
    }
  }

  async deletePartner(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('partners')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Erreur deletePartner:', error)
      throw error
    }
  }

  // ============================================
  // GESTION DES PARRAINAGES
  // ============================================

  async createReferral(partnerCode: string, userEmail: string, userName: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.rpc('create_referral', {
        p_partner_code: partnerCode,
        p_user_email: userEmail,
        p_user_name: userName
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erreur createReferral:', error)
      throw error
    }
  }

  async getReferralsByPartner(partnerId: string): Promise<Referral[]> {
    try {
      const { data, error } = await this.supabase
        .from('referrals')
        .select('*')
        .eq('partner_id', partnerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur getReferralsByPartner:', error)
      throw error
    }
  }

  async getPartnerStats(): Promise<PartnerStats[]> {
    try {
      const { data, error } = await this.supabase
        .from('partner_stats')
        .select('*')
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur getPartnerStats:', error)
      throw error
    }
  }

  async markReferralAsUsed(promoCode: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('referrals')
        .update({ 
          is_used: true, 
          used_at: new Date().toISOString() 
        })
        .eq('promo_code', promoCode)

      if (error) throw error
    } catch (error) {
      console.error('Erreur markReferralAsUsed:', error)
      throw error
    }
  }

  async getUnexportedReferrals(): Promise<Referral[]> {
    try {
      const { data, error } = await this.supabase
        .from('referrals')
        .select('*')
        .eq('restomax_synced', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur getUnexportedReferrals:', error)
      throw error
    }
  }

  async markReferralsAsSynced(referralIds: string[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('referrals')
        .update({ 
          restomax_synced: true, 
          synced_at: new Date().toISOString() 
        })
        .in('id', referralIds)

      if (error) throw error
    } catch (error) {
      console.error('Erreur markReferralsAsSynced:', error)
      throw error
    }
  }

  // ============================================
  // UPLOAD DE LOGO
  // ============================================

  async uploadLogo(file: File, partnerCode: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${partnerCode}-${Date.now()}.${fileExt}`
      const filePath = `partner-logos/${fileName}`

      const { error: uploadError } = await this.supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data } = this.supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Erreur uploadLogo:', error)
      throw error
    }
  }

  // ============================================
  // GÉNÉRATION DE CODE URL
  // ============================================

  generateUrlCode(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retire les accents
      .replace(/[^a-z0-9\s-]/g, '') // Garde que lettres, chiffres, espaces et tirets
      .trim()
      .replace(/\s+/g, '-') // Remplace espaces par tirets
      .replace(/-+/g, '-') // Évite plusieurs tirets consécutifs
  }
}

export const partnersAPI = new PartnersAPI()
