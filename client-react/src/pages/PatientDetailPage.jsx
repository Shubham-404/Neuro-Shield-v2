import React, { useEffect, useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Patients, Predictions } from '../services/api'
import { PageLoader } from '../components/ui/loader'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'

export default function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [patient, setPatient] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isAuthenticated, loading: authLoading } = useAuth()

  useEffect(() => {
    // Wait for auth to be ready before making API calls
    if (authLoading || !isAuthenticated || !id) {
      return
    }

    const fetchPatient = async () => {
      try {
        setLoading(true)
        const response = await Patients.detail(id)
        if (response.data.success) {
          setPatient(response.data.patient)
        } else {
          setError('Patient not found')
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          setError(err.response?.data?.message || 'Failed to load patient')
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { title: 'Error', description: 'Failed to load patient', variant: 'destructive' }
          }))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [id, authLoading, isAuthenticated])

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await Predictions.getHistory(id)
        if (response.data.success) {
          setPredictions(response.data.predictions || [])
        }
      } catch (err) {
        console.error('Failed to load predictions:', err)
      }
    }

    if (id && tab === 'predictions') {
      fetchPredictions()
    }
  }, [id, tab])

  if (loading) return <Shell><PageLoader show={true} /></Shell>
  if (error || !patient) return <Shell><div className="p-6 text-red-600">{error || 'Patient not found'}</div></Shell>

  const latestPrediction = predictions.length > 0 ? predictions[0] : null
  const getRiskColor = (risk) => {
    if (risk === 'High') return 'text-red-600'
    if (risk === 'Moderate') return 'text-amber-600'
    return 'text-green-600'
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{patient.name || 'Patient'}</h1>
            <p className="text-sm text-slate-500">
              {patient.email && `${patient.email} • `}
              {patient.age && `Age: ${patient.age}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/patients/${id}/predict`)}>Run Prediction</Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {['overview', 'predictions'].map((k) => (
              <TabsTrigger key={k} active={tab === k} onClick={() => setTab(k)}>{k[0].toUpperCase() + k.slice(1)}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent>
            {tab === 'overview' && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader><CardTitle>Demographics</CardTitle></CardHeader>
                  <CardContent className="text-sm text-slate-600 space-y-1">
                    {patient.gender && <div>Gender: {patient.gender}</div>}
                    {patient.age && <div>Age: {patient.age}</div>}
                    {patient.email && <div>Email: {patient.email}</div>}
                    {patient.medical_history && <div>Medical History: {patient.medical_history}</div>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Clinical Data</CardTitle></CardHeader>
                  <CardContent className="text-sm text-slate-600 space-y-1">
                    {patient.hypertension !== undefined && <div>Hypertension: {patient.hypertension ? 'Yes' : 'No'}</div>}
                    {patient.heart_disease !== undefined && <div>Heart Disease: {patient.heart_disease ? 'Yes' : 'No'}</div>}
                    {patient.avg_glucose_level && <div>Avg Glucose: {patient.avg_glucose_level}</div>}
                    {patient.bmi && <div>BMI: {patient.bmi}</div>}
                    {patient.smoking_status && <div>Smoking: {patient.smoking_status}</div>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Current risk</CardTitle></CardHeader>
                  <CardContent>
                    {latestPrediction ? (
                      <>
                        <div className={`text-3xl font-bold ${getRiskColor(latestPrediction.risk_level)}`}>
                          {latestPrediction.risk_level}
                        </div>
                        <div className="text-xs text-slate-500">
                          Probability: {(latestPrediction.probability * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(latestPrediction.created_at).toLocaleDateString()}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-slate-400">No prediction</div>
                        <div className="text-xs text-slate-500">Run a prediction to see risk level</div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === 'predictions' && (
              <Card>
                <CardHeader><CardTitle>Prediction History</CardTitle></CardHeader>
                <CardContent>
                  {predictions.length === 0 ? (
                    <p className="text-sm text-slate-600">No predictions yet. Run a prediction to get started.</p>
                  ) : (
                    <div className="space-y-4">
                      {predictions.map((pred) => (
                        <div key={pred.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={pred.risk_level === 'High' ? 'destructive' : pred.risk_level === 'Moderate' ? 'warning' : 'success'}>
                                {pred.risk_level}
                              </Badge>
                              <span className="text-sm font-medium">Probability: {(pred.probability * 100).toFixed(1)}%</span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {new Date(pred.created_at).toLocaleString()}
                            </span>
                          </div>
                          {pred.key_factors && Object.keys(pred.key_factors).length > 0 && (
                            <div className="text-xs text-slate-600 mt-2">
                              <strong>Key factors:</strong> {Object.entries(pred.key_factors).map(([k, v]) => `${k}: ${v}`).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  )
}
