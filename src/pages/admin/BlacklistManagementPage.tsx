import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"

import { blacklistApi } from "@/services/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"

const blacklistSchema = z.object({
  username_roblox: z.string().min(1, "Username wajib diisi"),
  alasan: z.string().min(1, "Alasan wajib diisi"),
})

type BlacklistForm = z.infer<typeof blacklistSchema>

export default function BlacklistManagementPage() {
  const queryClient = useQueryClient()
  const [successMsg, setSuccessMsg] = useState("")

  const userDataString = localStorage.getItem("sisp_user")
  let user = null
  try {
    user = userDataString ? JSON.parse(userDataString) : null
  } catch (e) {
    user = null
  }
  const isSuperadmin = user?.role === "superadmin"
  const canDelete = user?.can_delete || isSuperadmin

  const { data: blacklist, isLoading } = useQuery({
    queryKey: ["blacklist"],
    queryFn: blacklistApi.getAll
  })

  const deleteMutation = useMutation({
    mutationFn: blacklistApi.deleteBlacklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blacklist"] })
      setSuccessMsg("Blacklist berhasil dihapus.")
      setTimeout(() => setSuccessMsg(""), 3000)
    }
  })

  const handleDelete = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini dari blacklist?")) {
      deleteMutation.mutate(id)
    }
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BlacklistForm>({
    resolver: zodResolver(blacklistSchema),
  })

  const addMutation = useMutation({
    mutationFn: blacklistApi.addBlacklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blacklist"] })
      setSuccessMsg("User berhasil ditambahkan ke blacklist!")
      reset()
      setTimeout(() => setSuccessMsg(""), 3000)
    }
  })

  const onSubmit = (data: BlacklistForm) => {
    addMutation.mutate({
      username_roblox: data.username_roblox,
      alasan: data.alasan
    })
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-[48px] font-bold text-[var(--color-ink)] mb-2">Manajemen Blacklist</h1>
        <p className="text-[18px] text-[var(--color-body)] font-light">Tambah dan pantau daftar blacklist (ban permanen).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah Blacklist */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-[20px] font-bold text-[var(--color-ink)] mb-6">Tambah Blacklist Baru</h2>
            
            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 border border-[var(--color-success)] text-[var(--color-success)] text-[14px]">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-ink)]">Username Roblox</label>
                <Input {...register("username_roblox")} placeholder="e.g. BudiTNI" />
                {errors.username_roblox && <p className="text-[var(--color-error)] text-[12px]">{errors.username_roblox.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-ink)]">Alasan</label>
                <textarea 
                  {...register("alasan")}
                  className="flex w-full border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[16px] text-[var(--color-ink)] font-light focus-visible:outline-none focus-visible:border-[var(--color-ink)] rounded-none min-h-[100px]"
                  placeholder="Alasan blacklist..."
                ></textarea>
                {errors.alasan && <p className="text-[var(--color-error)] text-[12px]">{errors.alasan.message}</p>}
              </div>

              <Button type="submit" variant="primary" className="w-full gap-2 mt-4" disabled={addMutation.isPending}>
                <Plus className="w-4 h-4" /> 
                {addMutation.isPending ? "Menyimpan..." : "Simpan Blacklist"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Tabel Data */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <h2 className="text-[20px] font-bold text-[var(--color-ink)] mb-6">Daftar Blacklist</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-[var(--color-surface-soft)]">
                    <tr>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)] w-[30%]">Username</th>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)]">Alasan</th>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)] text-right w-[15%]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blacklist?.map((item) => (
                      <tr key={item.id} className="border-b border-[var(--color-hairline)] last:border-0 hover:bg-[var(--color-surface-card)] transition-colors">
                        <td className="px-4 py-4 font-bold text-[var(--color-error)]">{item.username_roblox}</td>
                        <td className="px-4 py-4 text-[var(--color-body)]">{item.alasan}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {canDelete && (
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="text-[var(--color-muted)] hover:text-[var(--color-error)] transition-colors p-1"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {blacklist?.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-[var(--color-muted)]">
                          Belum ada data blacklist.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
