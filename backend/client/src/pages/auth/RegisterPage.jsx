import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Input, Label } from '../../components/ui/input'
import { Button } from '../../components/ui/button'

export default function RegisterPage() {
  const [step, setStep] = React.useState(1)
  const [form, setForm] = React.useState({ org: '', name: '', email: '', password: '', role: '' })
  const next = () => setStep((s)=> Math.min(3, s+1))
  const prev = () => setStep((s)=> Math.max(1, s-1))

  const onSubmit = async (e) => {
    e.preventDefault()
    // TODO: Integrate API
    alert('Registered (placeholder)')
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {step === 1 && (
              <div className="space-y-3">
                <div>
                  <Label>Organization</Label>
                  <Input value={form.org} onChange={(e)=> setForm({...form, org: e.target.value})} placeholder="City General Hospital" required />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={form.role} onChange={(e)=> setForm({...form, role: e.target.value})} placeholder="Neurologist" required />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <Label>Full name</Label>
                  <Input value={form.name} onChange={(e)=> setForm({...form, name: e.target.value})} placeholder="Jane Doe" required />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e)=> setForm({...form, email: e.target.value})} placeholder="you@hospital.org" required />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-3">
                <div>
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={(e)=> setForm({...form, password: e.target.value})} placeholder="••••••••" required />
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prev} disabled={step===1}>Back</Button>
              {step < 3 ? (
                <Button type="button" onClick={next}>Next</Button>
              ) : (
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create account</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
