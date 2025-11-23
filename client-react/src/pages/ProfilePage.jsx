import React, { useEffect, useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Input, Label, Textarea } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Doctor, Auth } from '../services/api'
import { PageLoader } from '../components/ui/loader'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('[ProfilePage] Starting profile fetch for user:', user?.role);
        setLoading(true)

        // Use dashboard endpoint which works for all roles
        const response = await Auth.dashboard()
        if (response.data.success && response.data.user) {
          const userData = response.data.user
          const profileData = userData.profile || {}

          console.log('[ProfilePage] Profile fetched successfully:', profileData);
          setProfile(profileData)

          // Reset form based on role
          if (userData.role === 'doctor') {
            reset({
              full_name: profileData.full_name || '',
              email: profileData.email || userData.email || '',
              specialization: profileData.specialization || '',
            })
          } else if (userData.role === 'patient') {
            reset({
              name: profileData.name || '',
              email: profileData.email || userData.email || '',
              age: profileData.age || '',
              gender: profileData.gender || '',
            })
          } else {
            reset({
              name: profileData.name || '',
              email: profileData.email || userData.email || '',
            })
          }
        } else {
          throw new Error('Failed to fetch profile')
        }
      } catch (err) {
        console.error('[ProfilePage] Error fetching profile:', err);
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: err.response?.data?.message || 'Failed to load profile', variant: 'destructive' }
        }))
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [reset, user])

  const onSubmit = async (data) => {
    try {
      console.log('[ProfilePage] Submitting profile update:', data);

      if (user?.role === 'doctor') {
        const response = await Doctor.updateProfile(data)
        if (response.data.success) {
          setProfile(response.data.doctor)
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { title: 'Success', description: 'Profile updated successfully', variant: 'success' }
          }))
        }
      } else {
        // For patients, we'd need a patient update endpoint
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Info', description: 'Patient profile updates coming soon', variant: 'default' }
        }))
      }
    } catch (err) {
      console.error('[ProfilePage] Error updating profile:', err);
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: err.response?.data?.message || 'Failed to update profile', variant: 'destructive' }
      }))
    }
  }

  if (loading) return <Shell><PageLoader show={true} /></Shell>

  const isDoctor = user?.role === 'doctor'
  const isPatient = user?.role === 'patient'

  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>User details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleSubmit(onSubmit)}>
                {isDoctor ? (
                  <>
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
                  </>
                ) : isPatient ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input placeholder="Full Name" {...register('name')} />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input type="email" placeholder="you@example.com" {...register('email')} disabled />
                      </div>
                      <div>
                        <Label>Age</Label>
                        <Input type="number" placeholder="Age" {...register('age')} />
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <Input placeholder="Gender" {...register('gender')} />
                      </div>
                      <div>
                        <Label>Blood Group</Label>
                        <Input placeholder="e.g. O+" {...register('blood_group')} disabled />
                      </div>
                      <div>
                        <Label>BMI</Label>
                        <Input placeholder="BMI" value={profile?.bmi || ''} disabled />
                      </div>
                      <div>
                        <Label>Avg Glucose Level</Label>
                        <Input placeholder="Glucose" value={profile?.avg_glucose_level || ''} disabled />
                      </div>
                      <div>
                        <Label>Hypertension</Label>
                        <Input value={profile?.hypertension ? 'Yes' : 'No'} disabled />
                      </div>
                      <div>
                        <Label>Heart Disease</Label>
                        <Input value={profile?.heart_disease ? 'Yes' : 'No'} disabled />
                      </div>
                      <div>
                        <Label>Smoking Status</Label>
                        <Input value={profile?.smoking_status || 'Unknown'} disabled />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Medical History</Label>
                      <Textarea
                        placeholder="Medical History"
                        value={profile?.medical_history || ''}
                        disabled
                        className="h-24"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Name</Label>
                      <Input placeholder="Name" {...register('name')} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" placeholder="Email" {...register('email')} disabled />
                    </div>
                  </>
                )}
                {isDoctor && (
                  <div className="flex justify-end mt-4">
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-600">
                <p><strong>Role:</strong> {user?.role || 'Unknown'}</p>
                {profile?.created_at && (
                  <p className="mt-2"><strong>Member since:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
