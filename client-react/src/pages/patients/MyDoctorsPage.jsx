import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shell } from '../../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input, Label } from '../../components/ui/input'
import { Patients } from '../../services/api'
import { PageLoader } from '../../components/ui/loader'
import { UserPlus, Trash2, Stethoscope, Mail, Building } from 'lucide-react'

export default function MyDoctorsPage() {
    const [email, setEmail] = useState('')
    const queryClient = useQueryClient()

    // Fetch My Doctors
    const { data: doctors = [], isLoading } = useQuery({
        queryKey: ['my-doctors'],
        queryFn: async () => {
            const res = await Patients.getMyDoctors()
            return res.data.doctors || []
        }
    })

    // Add Doctor Mutation
    const addDoctorMutation = useMutation({
        mutationFn: (email) => Patients.addDoctor(email),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-doctors'])
            setEmail('')
            window.dispatchEvent(new CustomEvent('toast', {
                detail: { title: 'Success', description: 'Doctor added successfully', variant: 'default' }
            }))
        },
        onError: (err) => {
            window.dispatchEvent(new CustomEvent('toast', {
                detail: { title: 'Error', description: err.response?.data?.message || 'Failed to add doctor', variant: 'destructive' }
            }))
        }
    })

    // Remove Doctor Mutation
    const removeDoctorMutation = useMutation({
        mutationFn: (id) => Patients.removeDoctor(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-doctors'])
            window.dispatchEvent(new CustomEvent('toast', {
                detail: { title: 'Success', description: 'Doctor removed successfully', variant: 'default' }
            }))
        },
        onError: (err) => {
            window.dispatchEvent(new CustomEvent('toast', {
                detail: { title: 'Error', description: err.response?.data?.message || 'Failed to remove doctor', variant: 'destructive' }
            }))
        }
    })

    const handleAddDoctor = (e) => {
        e.preventDefault()
        if (!email) return
        addDoctorMutation.mutate(email)
    }

    if (isLoading) return <Shell><PageLoader show={true} /></Shell>

    return (
        <Shell>
            <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-2xl font-bold">My Doctors</h1>
                    <p className="text-slate-600 dark:text-slate-400">Manage the doctors who have access to your health data.</p>
                </div>

                {/* Add Doctor Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Add a Doctor
                        </CardTitle>
                        <CardDescription>
                            Grant a doctor access to your medical records by entering their email address.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddDoctor} className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="doctor-email">Doctor's Email</Label>
                                <Input
                                    id="doctor-email"
                                    type="email"
                                    placeholder="doctor@hospital.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={addDoctorMutation.isPending}>
                                {addDoctorMutation.isPending ? 'Adding...' : 'Add Doctor'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Doctors List */}
                <div className="grid gap-4">
                    <h2 className="text-xl font-semibold">Authorized Doctors</h2>
                    {doctors.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-slate-500">
                                <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>You haven't added any doctors yet.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        doctors.map((doctor) => (
                            <Card key={doctor.id}>
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                                            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{doctor.full_name || 'Unknown Doctor'}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                <Mail className="h-4 w-4" />
                                                {doctor.email}
                                            </div>
                                            {doctor.hospital && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    <Building className="h-4 w-4" />
                                                    {doctor.hospital}
                                                </div>
                                            )}
                                            {doctor.specialization && (
                                                <div className="mt-2">
                                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium">
                                                        {doctor.specialization}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to remove this doctor? They will lose access to your data.')) {
                                                removeDoctorMutation.mutate(doctor.id)
                                            }
                                        }}
                                        disabled={removeDoctorMutation.isPending}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </Shell>
    )
}
