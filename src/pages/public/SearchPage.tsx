import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import dayjs from "dayjs"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"
import { sanksiApi, blacklistApi } from "@/services/api"

export default function SearchPage() {
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const { data: sanksiList, isLoading: isSanksiLoading, isError: isSanksiError, isFetched: isSanksiFetched } = useQuery({
    queryKey: ["sanksi", searchQuery],
    queryFn: () => sanksiApi.searchByUsername(searchQuery),
    enabled: !!searchQuery,
  })

  const { data: blacklist, isLoading: isBlacklistLoading, isError: isBlacklistError, isFetched: isBlacklistFetched } = useQuery({
    queryKey: ["blacklist", searchQuery],
    queryFn: () => blacklistApi.searchByUsername(searchQuery),
    enabled: !!searchQuery,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim())
    }
  }

  const isLoading = isSanksiLoading || isBlacklistLoading
  const isError = isSanksiError || isBlacklistError
  const isFetched = isSanksiFetched && isBlacklistFetched

  return (
    <div className="flex flex-col">
      {/* Hero Band Dark */}
      <section className="bg-[var(--color-surface-dark)] text-[var(--color-on-dark)] py-[80px] px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
          <h1 className="text-[64px] font-bold leading-[1.05] mb-4 font-inter">Cek Status Sanksi</h1>
          <p className="text-[18px] text-[var(--color-on-dark-soft)] font-light max-w-2xl mb-12">
            Masukkan username Roblox Anda untuk memeriksa status kedisiplinan dan sisa masa sanksi di komunitas Puspomal TNI AL.
          </p>
          
          <form onSubmit={handleSearch} className="w-full max-w-md flex flex-col sm:flex-row gap-4">
            <Input 
              type="text" 
              placeholder="Username Roblox..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-white text-[var(--color-ink)]"
            />
            <Button type="submit" variant="primary" className="gap-2">
              <Search className="w-4 h-4" /> Cari
            </Button>
          </form>
        </div>
      </section>

      {/* Result Section */}
      <section className="py-[80px] px-8 bg-[var(--color-canvas)]">
        <div className="max-w-[800px] mx-auto">
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
              <p className="mt-4 text-[var(--color-muted)] font-light">Mencari data...</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-12 text-[var(--color-error)]">
              <p>Terjadi kesalahan saat mengambil data.</p>
            </div>
          )}

          {isFetched && !isLoading && (!sanksiList || sanksiList.length === 0) && (!blacklist || blacklist.length === 0) && (
            <Card className="text-center py-12">
              <h2 className="text-[24px] font-bold text-[var(--color-ink)] mb-2">Tidak Ditemukan</h2>
              <p className="text-[var(--color-body)] font-light">
                Tidak ada riwayat sanksi atau blacklist untuk username <span className="font-bold">"{searchQuery}"</span>.
              </p>
            </Card>
          )}

          {isFetched && !isLoading && ((sanksiList && sanksiList.length > 0) || (blacklist && blacklist.length > 0)) && (
            <div className="space-y-6">
              <h2 className="text-[32px] font-bold text-[var(--color-ink)] leading-[1.15]">Hasil Pencarian</h2>
              
              <div className="space-y-6">
                {/* Blacklist Section */}
                {blacklist && blacklist.length > 0 && (
                  <div className="mb-8">
                    {blacklist.map((bl) => (
                      <Card key={bl.id} className="border-[var(--color-error)] bg-[#fff5f5]">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="space-y-2">
                            <div className="inline-block px-3 py-1 bg-[var(--color-error)] text-white font-bold text-[14px] uppercase tracking-wider mb-2">
                              TERDAFTAR DI BLACKLIST
                            </div>
                            <h3 className="text-[28px] font-bold text-[var(--color-ink)]">{bl.username_roblox}</h3>
                            <div>
                              <p className="text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-muted)] mb-1">Alasan</p>
                              <p className="text-[16px] text-[var(--color-ink)] font-medium">{bl.alasan}</p>
                            </div>
                          </div>
                          <div className="p-4 bg-white border border-[var(--color-error)] border-opacity-30 rounded text-center w-full md:w-auto">
                            <p className="text-[14px] font-bold text-[var(--color-error)] mb-1 uppercase tracking-wider">Status</p>
                            <p className="text-[24px] font-black text-[var(--color-error)] leading-none">BANNED PERMANEN</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Sanksi Section */}
                {sanksiList && sanksiList.length > 0 && (
                  <div className="space-y-6">
                    {sanksiList.map((sanksi) => {
                  const now = dayjs()
                  const end = dayjs(sanksi.tanggal_selesai)
                  const diff = end.diff(now, 'day')
                  const isActive = diff > 0

                  return (
                    <Card key={sanksi.id} className={isActive ? "border-[var(--color-primary)]" : "opacity-75"}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <p className="text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-muted)] mb-1">Username</p>
                            <p className="text-[24px] font-bold text-[var(--color-ink)]">{sanksi.username_roblox}</p>
                          </div>
                          <div>
                            <p className="text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-muted)] mb-1">Jenis Sanksi</p>
                            <div className="inline-block px-3 py-1 bg-[var(--color-surface-strong)] text-[var(--color-ink)] font-bold text-[14px]">
                              {sanksi.jenis_sanksi === "RL" ? "Rank Lock" : sanksi.jenis_sanksi}
                            </div>
                          </div>
                          <div>
                            <p className="text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-muted)] mb-1">Keterangan</p>
                            <p className="text-[16px] text-[var(--color-body)] font-light">{sanksi.keterangan}</p>
                          </div>
                        </div>

                        <div className="space-y-6 md:border-l md:border-[var(--color-hairline)] md:pl-8">
                          <div>
                            <p className="text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-muted)] mb-1">Tanggal Mulai</p>
                            <p className="text-[16px] text-[var(--color-body)] font-light">{dayjs(sanksi.tanggal_mulai).format("DD MMMM YYYY")}</p>
                          </div>
                          <div>
                            <p className="text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-muted)] mb-1">Tanggal Selesai</p>
                            <p className="text-[16px] text-[var(--color-body)] font-light">{dayjs(sanksi.tanggal_selesai).format("DD MMMM YYYY")}</p>
                          </div>
                          
                          <div className={`p-4 border-l-4 ${isActive ? "bg-blue-50 border-[var(--color-primary)]" : "bg-[var(--color-surface-soft)] border-[var(--color-success)]"}`}>
                            <p className="text-[13px] font-bold tracking-[1.5px] uppercase text-[var(--color-muted)] mb-1">Status Masa Sanksi</p>
                            {isActive ? (
                              <p className="text-[20px] font-bold text-[var(--color-warning)]">Aktif ({diff} Hari Lagi)</p>
                            ) : (
                              <p className="text-[20px] font-bold text-[var(--color-success)]">Masa Sanksi Selesai</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
