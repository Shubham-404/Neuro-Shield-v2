// client-react/src/pages/patients/PatientDashboard.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { PatientFeatures, Predictions } from '../../services/api'
import { PageLoader } from '../../components/ui/loader'
import { useAuth } from '../../contexts/AuthContext'
import { AlertCircle, Activity, Heart, Droplet, Moon, Utensils, Dumbbell, AlertTriangle } from 'lucide-react'

export default function PatientDashboard() {
  const [recommendations, setRecommendations] = useState([])
  const [warnings, setWarnings] = useState([])
  const [latestPrediction, setLatestPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, loading: authLoading, user } = useAuth()

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      console.log('[PatientDashboard] Waiting for auth - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated);
      return;
    }

    // Get patient_id from user object (could be user.patient_id or user.id if role is patient)
    const patientId = user?.patient_id || (user?.role === 'patient' ? user?.id : null);
    
    if (!patientId) {
      console.error('[PatientDashboard] No patient_id found in user object:', user);
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: 'Patient ID not found. Please refresh the page.', variant: 'destructive' }
      }))
      return;
    }

    console.log('[PatientDashboard] Starting data fetch for patient:', patientId);

    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('[PatientDashboard] Fetching health recommendations...');
        
        // Fetch health recommendations
        const recResponse = await PatientFeatures.getRecommendations(patientId, { active_only: true })
        if (recResponse.data.success) {
          const allRecs = recResponse.data.recommendations || []
          console.log('[PatientDashboard] Loaded', allRecs.length, 'recommendations');
          setRecommendations(allRecs.filter(r => r.recommendation_type !== 'warning'))
          setWarnings(allRecs.filter(r => r.recommendation_type === 'warning' && r.priority === 'urgent'))
        } else {
          console.warn('[PatientDashboard] Failed to load recommendations:', recResponse.data);
        }

        // Fetch latest prediction
        try {
          console.log('[PatientDashboard] Fetching prediction history...');
          const predResponse = await Predictions.getHistory(patientId)
          if (predResponse.data.success && predResponse.data.predictions?.length > 0) {
            setLatestPrediction(predResponse.data.predictions[0])
          }
        } catch (err) {
          // No prediction yet, that's okay
        }

        // Generate system recommendations if none exist
        if (allRecs.length === 0) {
          try {
            console.log('[PatientDashboard] No recommendations found, generating system recommendations...');
            await PatientFeatures.generateRecommendations(patientId)
            // Refetch recommendations
            const recResponse2 = await PatientFeatures.getRecommendations(patientId, { active_only: true })
            if (recResponse2.data.success) {
              const allRecs2 = recResponse2.data.recommendations || []
              setRecommendations(allRecs2.filter(r => r.recommendation_type !== 'warning'))
              setWarnings(allRecs2.filter(r => r.recommendation_type === 'warning' && r.priority === 'urgent'))
            }
          } catch (err) {
            console.error('Error generating recommendations:', err)
          }
        }
      } catch (err) {
        console.error('[PatientDashboard] Error fetching data:', err);
        if (err.response?.status !== 401) {
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { title: 'Error', description: err.response?.data?.message || 'Failed to load dashboard', variant: 'destructive' }
          }))
        }
      } finally {
        setLoading(false)
        console.log('[PatientDashboard] Data fetch completed');
      }
    }

    fetchData()
  }, [authLoading, isAuthenticated, user])

  if (authLoading || loading) return <Shell><PageLoader show={true} /></Shell>

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'diet': return <Utensils className="h-5 w-5" />
      case 'exercise': return <Dumbbell className="h-5 w-5" />
      case 'sleep': return <Moon className="h-5 w-5" />
      case 'hydration': return <Droplet className="h-5 w-5" />
      case 'stress_management': return <Heart className="h-5 w-5" />
      default: return <Activity className="h-5 w-5" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'warning'
      case 'medium': return 'default'
      default: return 'outline'
    }
  }

  const riskColor = latestPrediction?.risk_level === 'High' ? 'destructive' : 
                    latestPrediction?.risk_level === 'Moderate' ? 'warning' : 'success'

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Patient'}</h1>
            <p className="text-slate-600 dark:text-slate-400">Your health dashboard</p>
          </div>
          <div className="flex gap-2">
            <Link to="/patients/records">
              <Button variant="outline">Medical Records</Button>
            </Link>
            <Link to="/patients/metrics">
              <Button variant="outline">Health Metrics</Button>
            </Link>
          </div>
        </div>

        {/* Urgent Warnings */}
        {warnings.length > 0 && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Urgent Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {warnings.map((warning) => (
                  <div key={warning.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 dark:text-red-100">{warning.title}</h4>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{warning.description}</p>
                      </div>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Risk Level */}
        {latestPrediction && (
          <Card>
            <CardHeader>
              <CardTitle>Current Stroke Risk Assessment</CardTitle>
              <CardDescription>Your latest risk prediction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Risk Level</p>
                  <Badge variant={riskColor} className="mt-2 text-lg px-4 py-1">
                    {latestPrediction.risk_level || 'Not Available'}
                  </Badge>
                  {latestPrediction.probability && (
                    <p className="text-sm text-slate-500 mt-2">
                      Probability: {(latestPrediction.probability * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
                <Link to="/patients/prediction">
                  <Button>View Details</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Recommendations */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRecommendationIcon(rec.recommendation_type)}
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                  </div>
                  <Badge variant={getPriorityColor(rec.priority)}>{rec.priority}</Badge>
                </div>
                <CardDescription className="capitalize">{rec.recommendation_type.replace('_', ' ')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{rec.description}</p>
                {rec.category && (
                  <Badge variant="outline" className="mt-2">{rec.category}</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {recommendations.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-slate-500">No active recommendations yet.</p>
              <p className="text-sm text-slate-400 mt-2">Your doctor will add personalized recommendations here.</p>
            </CardContent>
          </Card>
        )}

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
              <Link to="/patients/doctors">
                <Button variant="outline" className="w-full h-20 flex-col">
                  <Activity className="h-6 w-6 mb-2" />
                  Find Doctors
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}

