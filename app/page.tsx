import { LoginForm } from "@/components/login-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
