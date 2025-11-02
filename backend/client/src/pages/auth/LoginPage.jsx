import React from 'react'
import { Shell } from '../../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Input, Label } from '../../components/ui/input'
import { Button } from '../../components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: Integrate API
      await new Promise(r => setTimeout(r, 800))
      // Example toast
      window.dispatchEvent(new CustomEvent('toast', { detail: { title: 'Signed in', description: 'Welcome back!' } }))
    } catch (e) {
      // TODO: Replace alerts with shadcn/toast
      window.dispatchEvent(new CustomEvent('toast', { detail: { title: 'Login failed', description: 'Please check your credentials', variant: 'destructive' } }))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative gradient-bg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="absolute inset-0 p-10 text-white flex flex-col justify-end">
          <h2 className="text-3xl font-bold">NeuroShield</h2>
          <p className="opacity-90">Clinical-grade stroke severity prediction with explainability.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e)=> setEmail(e.target.value)} required placeholder="you@hospital.org" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e)=> setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>{loading? 'Signing in...':'Sign in'}</Button>
            </form>
            <div className="mt-4 text-sm">
              <span className="text-slate-500">Don't have an account?</span> <a href="/register" className="text-blue-600 hover:underline">Create one</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
