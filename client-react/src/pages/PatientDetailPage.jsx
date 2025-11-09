import React, { useEffect, useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Input, Label } from '../components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Patients, Predictions } from '../services/api'
import { PageLoader } from '../components/ui/loader'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'

export default function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [patient, setPatient] = useState(null)
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { register, handleSubmit, formState: { isSubmitting }, watch, setValue, reset } = useForm()
  const smokingStatus = watch('smoking_status')

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
          // Reset form with patient data
          reset({
            name: response.data.patient.name || '',
            age: response.data.patient.age || '',
            gender: response.data.patient.gender || '',
            medical_history: response.data.patient.medical_history || '',
            hypertension: response.data.patient.hypertension || false,
            heart_disease: response.data.patient.heart_disease || false,
            avg_glucose_level: response.data.patient.avg_glucose_level || '',
            bmi: response.data.patient.bmi || '',
            smoking_status: response.data.patient.smoking_status || 'Unknown'
          })
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
  }, [id, authLoading, isAuthenticated, reset])

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

  const onUpdateSubmit = async (data) => {
    try {
      const updateData = {
        name: data.name,
        age: data.age ? parseFloat(data.age) : null,
        gender: data.gender,
        medical_history: data.medical_history,
        hypertension: data.hypertension || false,
        heart_disease: data.heart_disease || false,
        avg_glucose_level: data.avg_glucose_level ? parseFloat(data.avg_glucose_level) : null,
        bmi: data.bmi ? parseFloat(data.bmi) : null,
        smoking_status: data.smoking_status || 'Unknown'
      }

      const response = await Patients.update(id, updateData)
      if (response.data.success) {
        setPatient(response.data.patient)
        setEditing(false)
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Success', description: 'Patient information updated successfully', variant: 'success' }
        }))
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: err.response?.data?.message || 'Failed to update patient', variant: 'destructive' }
      }))
    }
  }

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
            {!editing && (
              <>
                <Button variant="outline" onClick={() => setEditing(true)}>Edit Patient</Button>
                <Button variant="outline" onClick={() => navigate(`/patients/${id}/predict`)}>Run Prediction</Button>
              </>
            )}
            {editing && (
              <Button variant="outline" onClick={() => { setEditing(false); reset(); }}>
                Cancel Edit
              </Button>
            )}
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
              <>
                {!editing ? (
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
                        {patient.avg_glucose_level ? <div>Avg Glucose: {patient.avg_glucose_level} mg/dL</div> : <div className="text-amber-600">Avg Glucose: <strong>Missing</strong></div>}
                        {patient.bmi ? <div>BMI: {patient.bmi} kg/m²</div> : <div className="text-amber-600">BMI: <strong>Missing</strong></div>}
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
                ) : (
                  <Card>
                    <CardHeader><CardTitle>Edit Patient Information</CardTitle></CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit_name">Name</Label>
                            <Input id="edit_name" {...register('name')} />
                          </div>
                          <div>
                            <Label htmlFor="edit_age">Age *</Label>
                            <Input id="edit_age" type="number" {...register('age', { valueAsNumber: true, required: true })} />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit_gender">Gender</Label>
                            <Input id="edit_gender" {...register('gender')} />
                          </div>
                          <div>
                            <Label htmlFor="edit_medical_history">Medical History</Label>
                            <Input id="edit_medical_history" {...register('medical_history')} />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit_avg_glucose_level">Avg Glucose Level (mg/dL) *</Label>
                            <Input 
                              id="edit_avg_glucose_level" 
                              type="number" 
                              step="0.1"
                              {...register('avg_glucose_level', { 
                                valueAsNumber: true, 
                                required: 'Required for predictions',
                                min: { value: 0, message: 'Must be positive' }
                              })} 
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_bmi">BMI (kg/m²) *</Label>
                            <Input 
                              id="edit_bmi" 
                              type="number" 
                              step="0.1"
                              {...register('bmi', { 
                                valueAsNumber: true, 
                                required: 'Required for predictions',
                                min: { value: 0, message: 'Must be positive' }
                              })} 
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="edit_smoking_status">Smoking Status *</Label>
                          <Select value={smokingStatus || 'Unknown'} onValueChange={(val) => setValue('smoking_status', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select smoking status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="never smoked">Never Smoked</SelectItem>
                              <SelectItem value="formerly smoked">Formerly Smoked</SelectItem>
                              <SelectItem value="smokes">Smokes</SelectItem>
                              <SelectItem value="Unknown">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                          <input type="hidden" {...register('smoking_status', { required: true })} />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="edit_hypertension" 
                              {...register('hypertension')} 
                              className="w-4 h-4"
                            />
                            <Label htmlFor="edit_hypertension" className="cursor-pointer">Hypertension</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              id="edit_heart_disease" 
                              {...register('heart_disease')} 
                              className="w-4 h-4"
                            />
                            <Label htmlFor="edit_heart_disease" className="cursor-pointer">Heart Disease</Label>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button type="button" variant="outline" onClick={() => { setEditing(false); reset(); }}>
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </>
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
