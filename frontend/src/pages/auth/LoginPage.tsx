import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Home } from 'lucide-react'
import type { LoginCredentials } from '@/types'

export function LoginPage() {
  const { login, isLoading } = useAuthStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>()

  const onSubmit = async (data: LoginCredentials) => {
    setIsSubmitting(true)
    try {
      await login(data)
      toast({
        title: "Login successful",
        description: "Welcome to M&A CRM",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Home className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">M&A CRM</h1>
          </div>
          <CardTitle className="text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the deal pipeline
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || isSubmitting}
            >
              {(isLoading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p><strong>Admin:</strong> admin@example.com / admin123</p>
              <p><strong>Associate:</strong> associate@example.com / associate123</p>
              <p><strong>Analyst:</strong> analyst@example.com / analyst123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}