import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Shield, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react"

import { authApi } from "@/services/api"
import type { Role } from "@/services/api"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import dayjs from "dayjs"

const userSchema = z.object({
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["admin", "superadmin"]),
  can_update: z.boolean().default(false),
  can_delete: z.boolean().default(false)
})

type UserForm = z.infer<typeof userSchema>

export default function UserManagementPage() {
  const queryClient = useQueryClient()
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: authApi.getUsers
  })

  const addMutation = useMutation({
    mutationFn: (data: UserForm) => authApi.addUser(data.email, data.password, data.role as Role, data.can_update, data.can_delete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setSuccessMsg("User berhasil ditambahkan.")
      reset()
      setTimeout(() => setSuccessMsg(""), 3000)
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Gagal menambahkan user")
      setTimeout(() => setErrorMsg(""), 3000)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, can_update, can_delete }: { id: number, can_update: boolean, can_delete: boolean }) => 
      authApi.updatePermissions(id, can_update, can_delete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: authApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    }
  })

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "admin",
      can_update: false,
      can_delete: false
    }
  })

  const roleValue = watch("role")

  const onSubmit = (data: UserForm) => {
    addMutation.mutate(data)
  }

  const handleDelete = (id: number) => {
    if (window.confirm("Yakin ingin menghapus user ini?")) {
      deleteMutation.mutate(id)
    }
  }

  const toggleUpdate = (id: number, currentUpdate: boolean, currentDelete: boolean) => {
    updateMutation.mutate({ id, can_update: !currentUpdate, can_delete: currentDelete })
  }

  const toggleDelete = (id: number, currentUpdate: boolean, currentDelete: boolean) => {
    updateMutation.mutate({ id, can_update: currentUpdate, can_delete: !currentDelete })
  }

  return (
    <div className="flex-1 p-8 text-[var(--color-ink)] max-w-[1440px] mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-bold leading-[1.15] mb-2">Kelola Admin</h1>
          <p className="text-[16px] text-[var(--color-body)] font-light">Tambahkan dan atur hak akses admin untuk manajemen sanksi.</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border border-[var(--color-success)] text-[var(--color-success)] font-bold">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-[var(--color-error)] text-[var(--color-error)] font-bold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Tambah User */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <h2 className="text-[20px] font-bold mb-6 pb-4 border-b border-[var(--color-hairline)]">Tambah User Baru</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-muted)] mb-2">
                  Email
                </label>
                <Input type="email" {...register("email")} placeholder="admin@puspomal.com" />
                {errors.email && <p className="text-[var(--color-error)] text-[12px] mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-muted)] mb-2">
                  Password
                </label>
                <Input type="password" {...register("password")} placeholder="******" />
                {errors.password && <p className="text-[var(--color-error)] text-[12px] mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-muted)] mb-2">
                  Role
                </label>
                <select 
                  {...register("role")}
                  className="w-full h-12 px-4 bg-white border border-[var(--color-hairline)] text-[16px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-primary)] transition-colors rounded-none appearance-none"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
                {errors.role && <p className="text-[var(--color-error)] text-[12px] mt-1">{errors.role.message}</p>}
              </div>

              {roleValue === "admin" && (
                <div className="space-y-3 pt-2">
                  <label className="block text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-muted)] mb-2">
                    Akses Tambahan
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register("can_update")} className="w-5 h-5 accent-[var(--color-primary)]" />
                    <span className="text-[14px]">Bisa Edit Sanksi</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register("can_delete")} className="w-5 h-5 accent-[var(--color-primary)]" />
                    <span className="text-[14px]">Bisa Hapus Sanksi</span>
                  </label>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full mt-4" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Menambahkan..." : "Tambah User"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Tabel Daftar User */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-12 text-center text-[var(--color-muted)]">Memuat daftar user...</div>
              ) : (
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-[var(--color-surface-soft)]">
                    <tr>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)]">Email</th>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)]">Role</th>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)] text-center">Hak Edit</th>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)] text-center">Hak Hapus</th>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((item) => (
                      <tr key={item.id} className="border-b border-[var(--color-hairline)] last:border-0 hover:bg-[var(--color-surface-card)] transition-colors">
                        <td className="px-4 py-4 font-bold text-[var(--color-ink)]">
                          {item.email}
                          <div className="text-[12px] font-normal text-[var(--color-muted)] mt-1">Dibuat: {dayjs(item.created_at).format("DD/MM/YYYY")}</div>
                        </td>
                        <td className="px-4 py-4">
                          {item.role === 'superadmin' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-primary)] text-white font-bold text-[12px]">
                              <ShieldCheck className="w-3 h-3" /> SUPERADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-surface-strong)] text-[var(--color-ink)] font-bold text-[12px]">
                              <Shield className="w-3 h-3" /> ADMIN
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {item.role === 'admin' ? (
                            <input 
                              type="checkbox" 
                              checked={item.can_update} 
                              onChange={() => toggleUpdate(item.id, item.can_update, item.can_delete)}
                              className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer"
                            />
                          ) : (
                            <span className="text-[var(--color-muted)]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {item.role === 'admin' ? (
                            <input 
                              type="checkbox" 
                              checked={item.can_delete} 
                              onChange={() => toggleDelete(item.id, item.can_update, item.can_delete)}
                              className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer"
                            />
                          ) : (
                            <span className="text-[var(--color-muted)]">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {item.role === 'admin' && (
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="text-[var(--color-muted)] hover:text-[var(--color-error)] transition-colors p-1"
                              title="Hapus User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-muted)]">
                          Belum ada data user.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
