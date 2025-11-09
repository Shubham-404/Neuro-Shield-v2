import React, { useEffect, useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Input, Label, Textarea } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Doctor } from '../services/api'
import { PageLoader } from '../components/ui/loader'
import { useForm } from 'react-hook-form'

export default function ProfilePage() {
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await Doctor.getProfile()
        if (response.data.success) {
          setDoctor(response.data.doctor)
          reset({
            full_name: response.data.doctor.full_name || '',
            email: response.data.doctor.email || '',
            specialization: response.data.doctor.specialization || '',
          })
        }
      } catch (err) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: 'Failed to load profile', variant: 'destructive' }
        }))
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [reset])

  const onSubmit = async (data) => {
    try {
      const response = await Doctor.updateProfile(data)
      if (response.data.success) {
        setDoctor(response.data.doctor)
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Success', description: 'Profile updated successfully', variant: 'success' }
        }))
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: err.response?.data?.message || 'Failed to update profile', variant: 'destructive' }
      }))
    }
  }

  if (loading) return <Shell><PageLoader show={true} /></Shell>

  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>User details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <Label>Name</Label>
                  <Input placeholder="Full Name" {...register('full_name')} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@hospital.org" {...register('email')} disabled />
                </div>
                <div>
                  <Label>Specialization</Label>
                  <Input placeholder="Neurology" {...register('specialization')} />
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-600">
                <p><strong>Role:</strong> Doctor</p>
                {doctor?.created_at && (
                  <p className="mt-2"><strong>Member since:</strong> {new Date(doctor.created_at).toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
