import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import dayjs from "dayjs"
import { Plus, Trash2 } from "lucide-react"

import { sanksiApi } from "@/services/api"
import type { SanksiType } from "@/services/api"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"

const sanksiSchema = z.object({
  username_roblox: z.string().min(1, "Username wajib diisi"),
  jenis_sanksi: z.enum(["SP1", "SP2", "SP3", "RL"] as const, { required_error: "Pilih jenis sanksi" }),
  durasi_custom: z.number().min(1, "Durasi minimal 1 hari").optional().or(z.literal("").transform(() => undefined)),
  tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  keterangan: z.string().min(1, "Keterangan wajib diisi"),
}).refine(data => {
  if (data.jenis_sanksi === "RL" && !data.durasi_custom) {
    return false
  }
  return true
}, {
  message: "Durasi wajib diisi untuk Rank Lock",
  path: ["durasi_custom"]
})

type SanksiForm = z.infer<typeof sanksiSchema>

export default function DashboardPage() {
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
  const canUpdate = user?.can_update || isSuperadmin

  const { data: sanksiList, isLoading } = useQuery({
    queryKey: ["sanksiList"],
    queryFn: sanksiApi.getAll
  })

  const deleteMutation = useMutation({
    mutationFn: sanksiApi.deleteSanksi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanksiList"] })
      setSuccessMsg("Sanksi berhasil dihapus.")
      setTimeout(() => setSuccessMsg(""), 3000)
    }
  })

  const handleDelete = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data sanksi ini?")) {
      deleteMutation.mutate(id)
    }
  }

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<SanksiForm>({
    resolver: zodResolver(sanksiSchema),
    defaultValues: {
      tanggal_mulai: dayjs().format("YYYY-MM-DD")
    }
  })

  const watchJenis = watch("jenis_sanksi")

  const addMutation = useMutation({
    mutationFn: sanksiApi.addSanksi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sanksiList"] })
      setSuccessMsg("Data sanksi berhasil ditambahkan!")
      reset()
      setTimeout(() => setSuccessMsg(""), 3000)
    }
  })

  const onSubmit = (data: SanksiForm) => {
    addMutation.mutate({
      username_roblox: data.username_roblox,
      jenis_sanksi: data.jenis_sanksi,
      durasi_custom: data.jenis_sanksi === "RL" ? Number(data.durasi_custom) : undefined,
      tanggal_mulai: data.tanggal_mulai,
      keterangan: data.keterangan
    })
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-[48px] font-bold text-[var(--color-ink)] mb-2">Manajemen Sanksi</h1>
        <p className="text-[18px] text-[var(--color-body)] font-light">Tambah dan pantau riwayat sanksi personel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah Sanksi */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-[20px] font-bold text-[var(--color-ink)] mb-6">Tambah Sanksi Baru</h2>
            
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
                <label className="block text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-ink)]">Jenis Sanksi</label>
                <select 
                  {...register("jenis_sanksi")}
                  className="flex h-12 w-full border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[16px] text-[var(--color-ink)] font-light focus-visible:outline-none focus-visible:border-[var(--color-ink)] rounded-none"
                >
                  <option value="">Pilih Jenis...</option>
                  <option value="SP1">SP1 (30 Hari)</option>
                  <option value="SP2">SP2 (90 Hari)</option>
                  <option value="SP3">SP3 (180 Hari)</option>
                  <option value="RL">Rank Lock (Custom)</option>
                </select>
                {errors.jenis_sanksi && <p className="text-[var(--color-error)] text-[12px]">{errors.jenis_sanksi.message}</p>}
              </div>

              {watchJenis === "RL" && (
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-ink)]">Durasi (Hari)</label>
                  <Input type="number" {...register("durasi_custom", { valueAsNumber: true })} placeholder="e.g. 14" />
                  {errors.durasi_custom && <p className="text-[var(--color-error)] text-[12px]">{errors.durasi_custom.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-ink)]">Tanggal Mulai</label>
                <Input type="date" {...register("tanggal_mulai")} />
                {errors.tanggal_mulai && <p className="text-[var(--color-error)] text-[12px]">{errors.tanggal_mulai.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-ink)]">Keterangan</label>
                <textarea 
                  {...register("keterangan")}
                  className="flex w-full border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3 text-[16px] text-[var(--color-ink)] font-light focus-visible:outline-none focus-visible:border-[var(--color-ink)] rounded-none min-h-[100px]"
                  placeholder="Detail pelanggaran..."
                ></textarea>
                {errors.keterangan && <p className="text-[var(--color-error)] text-[12px]">{errors.keterangan.message}</p>}
              </div>

              <Button type="submit" variant="primary" className="w-full gap-2 mt-4" disabled={addMutation.isPending}>
                <Plus className="w-4 h-4" /> 
                {addMutation.isPending ? "Menyimpan..." : "Simpan Sanksi"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Tabel Data */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <h2 className="text-[20px] font-bold text-[var(--color-ink)] mb-6">Riwayat Sanksi</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-[var(--color-surface-soft)]">
                    <tr>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)]">Username</th>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)]">Jenis</th>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)]">Mulai</th>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)]">Selesai</th>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)]">Status</th>
                      <th className="px-4 py-3 font-bold tracking-[1.5px] uppercase text-[12px] text-[var(--color-muted)] border-b border-[var(--color-hairline)] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sanksiList?.map((item) => {
                      const diff = dayjs(item.tanggal_selesai).diff(dayjs(), 'day')
                      const isActive = diff > 0
                      return (
                        <tr key={item.id} className="border-b border-[var(--color-hairline)] last:border-0 hover:bg-[var(--color-surface-card)] transition-colors">
                          <td className="px-4 py-4 font-bold text-[var(--color-ink)]">{item.username_roblox}</td>
                          <td className="px-4 py-4">
                            <span className="inline-block px-2 py-1 bg-[var(--color-surface-strong)] text-[var(--color-ink)] font-bold text-[12px]">
                              {item.jenis_sanksi}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-[var(--color-body)]">{dayjs(item.tanggal_mulai).format("DD/MM/YY")}</td>
                          <td className="px-4 py-4 text-[var(--color-body)]">{dayjs(item.tanggal_selesai).format("DD/MM/YY")}</td>
                          <td className="px-4 py-4">
                            {isActive ? (
                              <span className="text-[var(--color-warning)] font-bold">Aktif ({diff}h)</span>
                            ) : (
                              <span className="text-[var(--color-success)] font-bold">Selesai</span>
                            )}
                          </td>
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
                      )
                    })}
                    {sanksiList?.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted)]">
                          Belum ada data sanksi.
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
