import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shell } from '../../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Activity, Heart, AlertCircle, Brain, Sparkles, Apple, Stethoscope, Loader2, AlertTriangle, User, FileText, Pill, Calendar } from 'lucide-react'
import { Patients } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export default function PatientDashboard() {
  const { user, isAuthenticated } = useAuth()
  const patientId = user?.patient_id || user?.id
  const queryClient = useQueryClient()

  // Fetch Patient Profile
  const { data: patient, isLoading, isError, error } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      console.log('[Dashboard] Fetching patient:', patientId)
      try {
        // Using getPatient (aliased to detail in api.js)
        const res = await Patients.getPatient(patientId)
        console.log('[Dashboard] Patient response:', res)
        return res.data.patient
      } catch (err) {
        console.error('[Dashboard] Fetch error:', err)
        throw err
      }
    },
    enabled: !!patientId && isAuthenticated,
    retry: 1
  })

  // Fetch AI Recommendations
  const { data: aiRecommendations } = useQuery({
    queryKey: ['ai-recommendations', patientId],
    queryFn: async () => {
      const res = await Patients.getAIRecommendations()
      return res.data.recommendations
    },
    enabled: !!patientId && isAuthenticated,
    staleTime: 1000 * 60 * 30, // 30 minutes
  })

  // Generate AI Recommendations Mutation
  const generateAIMutation = useMutation({
    mutationFn: () => Patients.generateAIRecommendations(),
    onSuccess: (data) => {
      queryClient.setQueryData(['ai-recommendations', patientId], data.data.recommendations)
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Success', description: 'New health analysis generated', variant: 'default' }
      }))
    },
    onError: (err) => {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: 'Failed to generate analysis', variant: 'destructive' }
      }))
    }
  })

  console.log('[Dashboard] State:', { patientId, isLoading, isError, patient })

  if (isLoading) return <Shell><div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />Loading profile...</div></Shell>

  if (isError) return (
    <Shell>
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-8 w-8 mx-auto mb-4" />
        <p>Failed to load profile.</p>
        <p className="text-sm mt-2">{error?.message || 'Unknown error'}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    </Shell>
  )

  if (!patient) return <Shell><div className="p-8 text-center">Patient profile not found.</div></Shell>

  return (
    <Shell>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
          <div className="text-sm text-slate-500">Welcome back, {patient.name}</div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">

          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-slate-900">
              <div className="h-24 bg-[#0f4c5c]"></div>
              <div className="px-6 pb-6 relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <div className="h-24 w-24 rounded-full border-4 border-white bg-slate-100 grid place-items-center shadow-md">
                    <User className="h-10 w-10 text-slate-400" />
                  </div>
                </div>
                <div className="mt-14 text-center">
                  <h2 className="text-xl font-bold">{patient.name}</h2>
                  <p className="text-sm text-slate-500">{patient.age} Years • {patient.gender}</p>
                  <Link to="/profile">
                    <Button className="mt-4 w-full bg-[#0f4c5c] hover:bg-[#0a3540]">Update Profile</Button>
                  </Link>
                </div>

                <div className="mt-8 space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Blood Group</span>
                      <span className="font-medium">{patient.blood_group || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Height</span>
                      <span className="font-medium">-- cm</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Weight</span>
                      <span className="font-medium">-- kg</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">BMI</span>
                      <span className="font-medium">{patient.bmi || '--'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Smoking</span>
                      <span className="font-medium">{patient.smoking_status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link to="/patients/records" className="block">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-0 shadow bg-indigo-50 dark:bg-indigo-900/20">
                  <FileText className="h-6 w-6 text-indigo-600 mb-2" />
                  <div className="font-semibold text-indigo-900 dark:text-indigo-100">Records</div>
                </Card>
              </Link>
              <Link to="/patients/my-doctors" className="block">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-0 shadow bg-teal-50 dark:bg-teal-900/20">
                  <Stethoscope className="h-6 w-6 text-teal-600 mb-2" />
                  <div className="font-semibold text-teal-900 dark:text-teal-100">Doctors</div>
                </Card>
              </Link>
            </div>
          </div>

          {/* Right Column: Metrics & AI */}
          <div className="lg:col-span-8 space-y-6">

            {/* Vitals Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 border-0 shadow-md flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-600 grid place-items-center mb-3">
                  <Heart className="h-5 w-5" />
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white">-- <span className="text-sm font-normal text-slate-500">bpm</span></div>
                <div className="text-sm text-slate-500 mt-1">Heart Rate</div>
              </Card>
              <Card className="p-6 border-0 shadow-md flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 grid place-items-center mb-3">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white">{patient.avg_glucose_level || '--'} <span className="text-sm font-normal text-slate-500">mg/dl</span></div>
                <div className="text-sm text-slate-500 mt-1">Glucose</div>
              </Card>
              <Card className="p-6 border-0 shadow-md flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 grid place-items-center mb-3">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="text-3xl font-bold text-slate-800 dark:text-white">{patient.hypertension ? 'High' : 'Normal'}</div>
                <div className="text-sm text-slate-500 mt-1">Blood Pressure</div>
              </Card>
            </div>

            {/* AI Health Assistant */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2"><Brain className="h-5 w-5" /> AI Health Assistant</h3>
                  <p className="text-indigo-100 text-sm">Personalized insights based on your latest vitals.</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => generateAIMutation.mutate()}
                  disabled={generateAIMutation.isPending}
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  {generateAIMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span className="ml-2">{generateAIMutation.isPending ? 'Analyzing...' : 'Refresh'}</span>
                </Button>
              </div>
              <CardContent className="p-6">
                {!aiRecommendations ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No analysis generated yet. Click refresh to start.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 grid place-items-center shrink-0">
                          <Apple className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">Dietary Advice</h4>
                          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                            {aiRecommendations.diet?.slice(0, 3).map((tip, i) => <li key={i}>{tip}</li>)}
                          </ul>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 grid place-items-center shrink-0">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">Exercise Plan</h4>
                          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                            {aiRecommendations.exercise?.slice(0, 3).map((tip, i) => <li key={i}>{tip}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-600 grid place-items-center shrink-0">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">Precautions</h4>
                          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                            {aiRecommendations.precautions?.slice(0, 3).map((tip, i) => <li key={i}>{tip}</li>)}
                          </ul>
                        </div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                        <h4 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2 text-sm mb-2">
                          <Stethoscope className="h-4 w-4" /> Doctor's Note
                        </h4>
                        <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                          {aiRecommendations.doctor_consultation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prescriptions / Reports Placeholder */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Pill className="h-5 w-5 text-slate-400" /> Prescriptions
                </h3>
                <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No active prescriptions
                </div>
              </Card>
              <Card className="border-0 shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-400" /> Recent Reports
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-white rounded border grid place-items-center">
                        <FileText className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Blood Test</div>
                        <div className="text-xs text-slate-500">12th Feb 2024</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600">View</Button>
                  </div>
                </div>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </Shell>
  )
}
