import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card } from "@/components/ui/Card"

import { authApi } from "@/services/api"

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid").min(1, "Email wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setErrorMsg("")
    try {
      const user = await authApi.login(data.email, data.password)
      if (user) {
        localStorage.setItem("sisp_admin_auth", "true")
        localStorage.setItem("sisp_user", JSON.stringify(user))
        navigate("/admin/dashboard")
      } else {
        setErrorMsg("Email atau password salah.")
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Terjadi kesalahan sistem.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <Card className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-bold text-[var(--color-ink)] mb-2">Login Puspomal</h1>
          <p className="text-[14px] text-[var(--color-body)] font-light">Masuk untuk mengelola data sanksi</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-[var(--color-error)] text-[var(--color-error)] text-[14px] font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? "Memeriksa..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
