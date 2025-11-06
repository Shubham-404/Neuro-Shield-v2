import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Input, Label } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { useForm } from 'react-hook-form'
import { Loader } from '../../components/ui/loader'

export default function RegisterPage() {
  const [step, setStep] = React.useState(1)
  const { register, handleSubmit, trigger, formState: { isSubmitting } } = useForm()
  const next = async () => {
    // Validate current step fields before proceeding
    const fields = step === 1 ? ['org','role'] : step === 2 ? ['name','email'] : ['password']
    const ok = await trigger(fields)
    if (ok) setStep((s)=> Math.min(3, s+1))
  }
  const prev = () => setStep((s)=> Math.max(1, s-1))

  const onSubmit = async (data) => {
    // TODO: Integrate API (Auth.register)
    await new Promise(r => setTimeout(r, 800))
    window.dispatchEvent(new CustomEvent('toast', { detail: { title: 'Account created', description: 'You can now sign in.' } }))
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Step {step} of 3</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {step === 1 && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="org">Organization</Label>
                  <Input id="org" placeholder="City General Hospital" {...register('org', { required: true })} />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="Neurologist" {...register('role', { required: true })} />
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Jane Doe" {...register('name', { required: true })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@hospital.org" {...register('email', { required: true })} />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...register('password', { required: true, minLength: 6 })} />
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={prev} disabled={step===1}>Back</Button>
              {step < 3 ? (
                <Button type="button" onClick={next}>Next</Button>
              ) : (
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                  {isSubmitting ? <Loader label="Creating..." /> : 'Create account'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
