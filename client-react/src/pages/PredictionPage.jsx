import React, { useEffect, useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useParams, useNavigate } from 'react-router-dom'
import { Predictions, Patients } from '../services/api'
import { PageLoader } from '../components/ui/loader'

export default function PredictionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true)
        const response = await Patients.detail(id)
        if (response.data.success) {
          setPatient(response.data.patient)
        }
      } catch (err) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: 'Failed to load patient', variant: 'destructive' }
        }))
        navigate('/patients')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPatient()
    }
  }, [id, navigate])

  const runPrediction = async () => {
    try {
      setRunning(true)
      
      // Validate patient has required data
      if (!patient) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: 'Patient data not loaded', variant: 'destructive' }
        }))
        return
      }
      
      const requiredFields = ['age', 'avg_glucose_level', 'bmi']
      const missingFields = requiredFields.filter(field => !patient[field] && patient[field] !== 0)
      
      if (missingFields.length > 0) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { 
            title: 'Missing Data', 
            description: `Please update patient information: ${missingFields.join(', ')}`, 
            variant: 'destructive' 
          }
        }))
        return
      }
      
      const response = await Predictions.run({ patient_id: id })
      if (response.data.success) {
        setPrediction(response.data.prediction)
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Success', description: 'Prediction completed successfully', variant: 'success' }
        }))
      } else {
        throw new Error(response.data.message || 'Prediction failed')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error?.detail ||
                          err.message || 
                          'Prediction failed. Please check if ML service is running.'
      
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: errorMessage, variant: 'destructive' }
      }))
      
      console.error('Prediction error:', err)
    } finally {
      setRunning(false)
    }
  }

  if (loading) return <Shell><PageLoader show={true} /></Shell>

  const getRiskColor = (risk) => {
    if (risk === 'High') return 'text-red-600'
    if (risk === 'Moderate') return 'text-amber-600'
    return 'text-green-600'
  }

  const getRiskBadge = (risk) => {
    if (risk === 'High') return <Badge variant="destructive">High</Badge>
    if (risk === 'Moderate') return <Badge variant="warning">Moderate</Badge>
    return <Badge variant="success">Low</Badge>
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Prediction</h1>
            <p className="text-sm text-slate-500">
              {patient ? `Patient: ${patient.name || 'N/A'}` : 'Loading patient...'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={runPrediction} disabled={running || !patient}>
              {running ? 'Running...' : 'Run Prediction'}
            </Button>
            <Button variant="outline" onClick={() => navigate(`/patients/${id}`)}>Back to Patient</Button>
          </div>
        </div>

        {!prediction ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">No prediction has been run yet.</p>
              <Button onClick={runPrediction} disabled={running || !patient} className="bg-indigo-600 hover:bg-indigo-700">
                {running ? 'Running Prediction...' : 'Run Prediction'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Risk score</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div>
                    <div className={`text-5xl font-extrabold ${getRiskColor(prediction.risk_level)}`}>
                      {prediction.probability ? (prediction.probability * 100).toFixed(1) : 'N/A'}%
                    </div>
                    <div className="text-sm text-slate-500">{prediction.risk_level} risk</div>
                  </div>
                  {getRiskBadge(prediction.risk_level)}
                </div>
                {prediction.key_factors && Object.keys(prediction.key_factors).length > 0 && (
                  <div className="mt-6">
                    <div className="text-sm font-medium mb-2">Key contributing factors</div>
                    <div className="space-y-2">
                      {Object.entries(prediction.key_factors).map(([key, value], i) => (
                        <div key={i} className="grid grid-cols-5 items-center gap-3">
                          <div className="col-span-2 text-sm text-slate-600 capitalize">{key.replace(/_/g, ' ')}</div>
                          <div className="col-span-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full bg-purple-600" style={{ width: `${Math.min(100, Math.abs(value) * 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 text-xs text-slate-500">
                  Prediction created: {new Date(prediction.created_at).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-2">
                {prediction.risk_level === 'High' && (
                  <>
                    <p>• Immediate clinical assessment recommended.</p>
                    <p>• Consider advanced imaging (CT angiography).</p>
                    <p>• Monitor vital signs closely.</p>
                    <p>• Prepare for potential intervention.</p>
                  </>
                )}
                {prediction.risk_level === 'Moderate' && (
                  <>
                    <p>• Regular monitoring recommended.</p>
                    <p>• Consider follow-up assessments.</p>
                    <p>• Monitor for symptom changes.</p>
                  </>
                )}
                {prediction.risk_level === 'Low' && (
                  <>
                    <p>• Continue routine monitoring.</p>
                    <p>• Standard care protocols apply.</p>
                  </>
                )}
                <p className="text-xs text-slate-400 mt-4">Generated suggestions; not a substitute for clinical judgment.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Shell>
  )
}
