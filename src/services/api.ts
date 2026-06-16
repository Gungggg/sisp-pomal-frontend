import { createClient } from '@supabase/supabase-js'
import dayjs from "dayjs"
import { supabase, supabaseUrl, supabaseKey } from "@/utils/supabase"

export type SanksiType = "SP1" | "SP2" | "SP3" | "RL"

export interface SanksiRecord {
  id: number
  username_roblox: string
  jenis_sanksi: SanksiType
  tanggal_mulai: string
  durasi_custom?: number
  tanggal_selesai: string
  keterangan: string
  created_at: string
}

export type Role = "superadmin" | "admin" | "pending"

export interface PermissionRecord {
  id: number
  user_id: string
  email: string
  role: Role
  can_update: boolean
  can_delete: boolean
  created_by: string | null
  created_at: string
}

export const authApi = {
  login: async (email: string, password: string): Promise<PermissionRecord | null> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (authError || !authData.user) throw new Error(authError?.message || "Login failed")

    // Ambil data permission
    const { data: permData, error: permError } = await supabase
      .from('sisp_permissions')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle()
      
    if (permError) {
      throw new Error(`DB Error: ${permError.message}`)
    }
    
    if (!permData) {
      throw new Error(`Data permission tidak ditemukan untuk UUID: ${authData.user.id}`)
    }

    return permData as PermissionRecord
  },

  logout: async () => {
    await supabase.auth.signOut()
  },
  
  getUsers: async (): Promise<PermissionRecord[]> => {
    const { data, error } = await supabase
      .from('sisp_permissions')
      .select('*')
      .order('id', { ascending: true })
    if (error) throw new Error(error.message)
    return (data || []) as PermissionRecord[]
  },

  addUser: async (email: string, password: string, role: Role, can_update: boolean, can_delete: boolean) => {
    // Gunakan temporary client agar tidak me-logout session superadmin saat ini
    const tempSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const { data: authData, error: authError } = await tempSupabase.auth.signUp({
      email,
      password
    })

    if (authError || !authData.user) throw new Error(authError?.message || "Gagal membuat user di Supabase Auth")

    const newUserId = authData.user.id

    // Dapatkan session superadmin saat ini untuk mengisi created_by
    const { data: sessionData } = await supabase.auth.getSession()
    const currentUserId = sessionData.session?.user?.id || null

    const { data: permData, error: permError } = await supabase
      .from('sisp_permissions')
      .insert([{ 
        user_id: newUserId, 
        email, 
        role, 
        can_update, 
        can_delete, 
        created_by: currentUserId 
      }])
      .select()
      .single()
      
    if (permError) throw new Error(permError.message)
    return permData as PermissionRecord
  },

  updatePermissions: async (id: number, can_update: boolean, can_delete: boolean) => {
    const { data, error } = await supabase
      .from('sisp_permissions')
      .update({ can_update, can_delete })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data as PermissionRecord
  },

  deleteUser: async (id: number) => {
    // Hanya menghapus permission-nya saja, auth.users tetap ada di backend Supabase 
    // tapi user tsb tidak akan bisa masuk ke admin panel
    const { error } = await supabase
      .from('sisp_permissions')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    return true
  }
}

export const sanksiApi = {
  searchByUsername: async (username: string): Promise<SanksiRecord[]> => {
    const { data, error } = await supabase
      .from('sanksi_puspomal')
      .select('*')
      .ilike('username_roblox', username)
      .order('id', { ascending: false })
      
    if (error) {
      console.error(error)
      return []
    }
    
    return (data || []) as SanksiRecord[]
  },

  getAll: async (): Promise<SanksiRecord[]> => {
    const { data, error } = await supabase
      .from('sanksi_puspomal')
      .select('*')
      .order('id', { ascending: false })
      
    if (error) throw new Error(error.message)
    return (data as SanksiRecord[]) || []
  },

  addSanksi: async (payload: Omit<SanksiRecord, "id" | "tanggal_selesai" | "created_at">): Promise<SanksiRecord> => {
    let durasi = 0
    if (payload.jenis_sanksi === "SP1") durasi = 30
    else if (payload.jenis_sanksi === "SP2") durasi = 90
    else if (payload.jenis_sanksi === "SP3") durasi = 180
    else if (payload.jenis_sanksi === "RL") durasi = payload.durasi_custom || 0

    const tglSelesai = dayjs(payload.tanggal_mulai).add(durasi, "day").format("YYYY-MM-DD")

    const newRecord = {
      username_roblox: payload.username_roblox,
      jenis_sanksi: payload.jenis_sanksi,
      durasi_custom: payload.durasi_custom,
      tanggal_mulai: payload.tanggal_mulai,
      tanggal_selesai: tglSelesai,
      keterangan: payload.keterangan,
    }

    const { data, error } = await supabase
      .from('sanksi_puspomal')
      .insert([newRecord])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as SanksiRecord
  },

  updateSanksi: async (id: number, payload: Partial<Omit<SanksiRecord, "id" | "created_at">>) => {
    if (payload.tanggal_mulai && payload.jenis_sanksi) {
      let durasi = 0
      if (payload.jenis_sanksi === "SP1") durasi = 30
      else if (payload.jenis_sanksi === "SP2") durasi = 90
      else if (payload.jenis_sanksi === "SP3") durasi = 180
      else if (payload.jenis_sanksi === "RL") durasi = payload.durasi_custom || 0
      payload.tanggal_selesai = dayjs(payload.tanggal_mulai).add(durasi, "day").format("YYYY-MM-DD")
    }

    const { data, error } = await supabase
      .from('sanksi_puspomal')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw new Error(error.message)
    return data as SanksiRecord
  },

  deleteSanksi: async (id: number) => {
    const { error } = await supabase
      .from('sanksi_puspomal')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    return true
  }
}
