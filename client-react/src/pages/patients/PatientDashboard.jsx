import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shell } from '../../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Activity, Heart, AlertCircle, Brain, Sparkles, Apple, Stethoscope, Loader2, AlertTriangle } from 'lucide-react'
import { Patients, PatientFeatures } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export default function PatientDashboard() {
  const { user, isAuthenticated } = useAuth()
  const patientId = user?.patient_id || user?.id
  const queryClient = useQueryClient()

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

  return (
    <Shell>
      <div className="space-y-6">
        {/* AI Health Assistant */}
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <Brain className="h-6 w-6" />
              AI Health Assistant
            </CardTitle>
            <CardDescription>
              Personalized health insights powered by Gemini AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!aiRecommendations ? (
                <div className="text-center py-6 text-slate-500">
                  <p className="mb-4">No recommendations generated yet.</p>
                  <Button
                    onClick={() => generateAIMutation.mutate()}
                    disabled={generateAIMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {generateAIMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Analysis
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center">
                        <Apple className="h-4 w-4 mr-2" /> Diet
                      </h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-slate-700 dark:text-slate-300">
                        {aiRecommendations.diet?.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center">
                        <Activity className="h-4 w-4 mr-2" /> Exercise
                      </h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-slate-700 dark:text-slate-300">
                        {aiRecommendations.exercise?.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" /> Precautions
                      </h4>
                      <ul className="list-disc list-inside text-sm space-y-1 text-slate-700 dark:text-slate-300">
                        {aiRecommendations.precautions?.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2 flex items-center">
                        <Stethoscope className="h-4 w-4 mr-2" /> Doctor's Note
                      </h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {aiRecommendations.doctor_consultation}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAIMutation.mutate()}
                      disabled={generateAIMutation.isPending}
                    >
                      {generateAIMutation.isPending ? 'Updating...' : 'Refresh Analysis'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/patients/records">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Activity className="h-6 w-6 mb-2" />
                  Medical Records
                </Button>
              </Link>
              <Link to="/patients/metrics">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Heart className="h-6 w-6 mb-2" />
                  Health Metrics
                </Button>
              </Link>
              <Link to="/patients/logs">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <AlertCircle className="h-6 w-6 mb-2" />
                  Health Logs
                </Button>
              </Link>
              <Link to="/patients/my-doctors">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Activity className="h-6 w-6 mb-2" />
                  My Doctors
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}
