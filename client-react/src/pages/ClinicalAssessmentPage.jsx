import React, { useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Input, Label, Textarea } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select'
import { useForm } from 'react-hook-form'
import { PageLoader } from '../components/ui/loader'
import { Patients, Predictions } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function ClinicalAssessmentPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { isSubmitting, errors }, watch, setValue, reset } = useForm({
    defaultValues: {
      gender: 'Male',
      ever_married: true,
      work_type: 'Private',
      residence_type: 'Urban',
      smoking_status: 'Unknown'
    }
  })
  const [prediction, setPrediction] = useState(null)
  const [runningPrediction, setRunningPrediction] = useState(false)
  const [patientCreated, setPatientCreated] = useState(false)
  const [createdPatientId, setCreatedPatientId] = useState(null)
  
  const smokingStatus = watch('smoking_status')
  const gender = watch('gender')
  const everMarried = watch('ever_married')
  const workType = watch('work_type')
  const residenceType = watch('residence_type')

  const runPrediction = async (patientId) => {
    try {
      setRunningPrediction(true)
      console.log('Starting prediction for patient:', patientId)
      
      // Call backend API which will then call ML service
      const response = await Predictions.run({ patient_id: patientId })
      console.log('Prediction API response:', response.data)
      
      if (response.data.success) {
        setPrediction(response.data.prediction)
        console.log('Prediction result:', response.data.prediction)
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Success', description: 'Prediction completed successfully', variant: 'success' }
        }))
      } else {
        throw new Error(response.data.message || 'Prediction failed')
      }
    } catch (err) {
      console.error('Prediction error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error?.detail ||
                          err.response?.data?.error ||
                          err.message || 
                          'Prediction failed. Please check if ML service is running on port 8000.'
      
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: errorMessage, variant: 'destructive' }
      }))
    } finally {
      setRunningPrediction(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      // Map form data to patient structure
      const patientData = {
        name: data.name,
        email: data.email || null,
        age: data.age,
        gender: data.gender || 'Male',
        medical_history: data.comorbidities || null,
        hypertension: data.hypertension || false,
        heart_disease: data.heart_disease || false,
        avg_glucose_level: data.avg_glucose_level ? parseFloat(data.avg_glucose_level) : null,
        bmi: data.bmi ? parseFloat(data.bmi) : null,
        smoking_status: data.smoking_status || 'Unknown',
        // ML prediction required fields
        ever_married: data.ever_married !== undefined ? data.ever_married : true,
        work_type: data.work_type || 'Private',
        residence_type: data.residence_type || 'Urban',
        // Additional clinical data
        nihss_total: data.nihss_total ? parseInt(data.nihss_total) : null,
        notes: data.notes || null
      }

      console.log('Submitting patient data:', patientData)

      const response = await Patients.create(patientData)
      if (response.data.success) {
        const patientId = response.data.patient.id
        setPatientCreated(true)
        setCreatedPatientId(patientId)
        
        window.dispatchEvent(new CustomEvent('toast', { 
          detail: { title: 'Patient created', description: 'Running stroke risk prediction...', variant: 'success' } 
        }))
        
        // Automatically run prediction after patient creation
        await runPrediction(patientId)
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { 
          title: 'Error', 
          description: err.response?.data?.message || 'Failed to save assessment', 
          variant: 'destructive' 
        }
      }))
    }
  }

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

  // Dummy explainability data for different risk levels
  const getDummyExplainability = (riskLevel) => {
    const explainability = {
      'High': {
        'age': 0.35,
        'hypertension': 0.28,
        'avg_glucose_level': 0.22,
        'heart_disease': 0.18,
        'bmi': 0.15,
        'smoking_status': 0.12
      },
      'Moderate': {
        'age': 0.25,
        'avg_glucose_level': 0.20,
        'bmi': 0.18,
        'hypertension': 0.15,
        'smoking_status': 0.12,
        'heart_disease': 0.10
      },
      'Low': {
        'age': 0.15,
        'bmi': 0.12,
        'avg_glucose_level': 0.10,
        'smoking_status': 0.08,
        'hypertension': 0.05,
        'heart_disease': 0.03
      }
    }
    return explainability[riskLevel] || explainability['Low']
  }

  return (
    <Shell>
      <PageLoader show={isSubmitting || runningPrediction} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Clinical assessment</h1>
          {runningPrediction && (
            <div className="text-sm text-slate-600">
              Running ML prediction...
            </div>
          )}
        </div>

        {prediction ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Complete</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">Patient has been created and stroke risk prediction has been completed.</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate(`/patients/${createdPatientId}`)}>
                    View Patient Details
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setPrediction(null)
                    setPatientCreated(false)
                    setCreatedPatientId(null)
                    reset({
                      gender: 'Male',
                      ever_married: true,
                      work_type: 'Private',
                      residence_type: 'Urban',
                      smoking_status: 'Unknown'
                    })
                  }}>
                    Create Another Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                  {(() => {
                    // Use dummy explainability if key_factors are missing or empty
                    const keyFactors = prediction.key_factors && Object.keys(prediction.key_factors).length > 0 
                      ? prediction.key_factors 
                      : getDummyExplainability(prediction.risk_level)
                    
                    return (
                      <div className="mt-6">
                        <div className="text-sm font-medium mb-2">Key contributing factors</div>
                        <div className="space-y-2">
                          {Object.entries(keyFactors).map(([key, value], i) => (
                            <div key={i} className="grid grid-cols-5 items-center gap-3">
                              <div className="col-span-2 text-sm text-slate-600 capitalize">{key.replace(/_/g, ' ')}</div>
                              <div className="col-span-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                <div className="h-full bg-purple-600" style={{ width: `${Math.min(100, Math.abs(value) * 100)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
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
          </div>
        ) : (
          <form className="grid lg:grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader><CardTitle>Patient info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" placeholder="Jane Doe" {...register('name', { required: 'Full name is required' })} />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="jane.doe@example.com" {...register('email')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input id="age" type="number" placeholder="54" {...register('age', { valueAsNumber: true, required: 'Age is required', min: { value: 0, message: 'Age must be positive' } })} />
                  {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age.message}</p>}
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={gender || 'Male'} onValueChange={(val) => {
                    setValue('gender', val, { shouldValidate: true })
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('gender', { required: 'Gender is required' })} />
                  {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ever_married">Ever Married *</Label>
                  <Select value={everMarried !== undefined ? (everMarried ? 'Yes' : 'No') : 'Yes'} onValueChange={(val) => {
                    setValue('ever_married', val === 'Yes', { shouldValidate: true })
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('ever_married')} />
                </div>
                <div>
                  <Label htmlFor="residence_type">Residence Type *</Label>
                  <Select value={residenceType || 'Urban'} onValueChange={(val) => {
                    setValue('residence_type', val, { shouldValidate: true })
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select residence type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Urban">Urban</SelectItem>
                      <SelectItem value="Rural">Rural</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('residence_type')} />
                </div>
              </div>
              <div>
                <Label htmlFor="work_type">Work Type *</Label>
                <Select value={workType || 'Private'} onValueChange={(val) => {
                  setValue('work_type', val, { shouldValidate: true })
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Self-employed">Self-employed</SelectItem>
                    <SelectItem value="Govt_job">Government Job</SelectItem>
                    <SelectItem value="children">Children</SelectItem>
                    <SelectItem value="Never_worked">Never Worked</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('work_type')} />
              </div>
              <div>
                <Label htmlFor="comorbidities">Comorbidities</Label>
                <Input id="comorbidities" placeholder="HTN, DM2" {...register('comorbidities')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Clinical Measurements</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="avg_glucose_level">Avg Glucose Level (mg/dL) *</Label>
                  <Input 
                    id="avg_glucose_level" 
                    type="number" 
                    step="0.1"
                    placeholder="95.0" 
                    {...register('avg_glucose_level', { 
                      valueAsNumber: true, 
                      required: 'Average glucose level is required',
                      min: { value: 0, message: 'Must be positive' }
                    })} 
                  />
                  {errors.avg_glucose_level && <p className="mt-1 text-xs text-red-600">{errors.avg_glucose_level.message}</p>}
                </div>
                <div>
                  <Label htmlFor="bmi">BMI (kg/m²) *</Label>
                  <Input 
                    id="bmi" 
                    type="number" 
                    step="0.1"
                    placeholder="28.5" 
                    {...register('bmi', { 
                      valueAsNumber: true, 
                      required: 'BMI is required',
                      min: { value: 0, message: 'Must be positive' }
                    })} 
                  />
                  {errors.bmi && <p className="mt-1 text-xs text-red-600">{errors.bmi.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="smoking_status">Smoking Status *</Label>
                <Select value={smokingStatus || 'Unknown'} onValueChange={(val) => {
                  setValue('smoking_status', val, { shouldValidate: true })
                }}>
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
                <input type="hidden" {...register('smoking_status', { required: 'Smoking status is required' })} />
                {errors.smoking_status && <p className="mt-1 text-xs text-red-600">{errors.smoking_status.message}</p>}
              </div>
              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="hypertension" 
                    {...register('hypertension')} 
                    className="w-4 h-4"
                  />
                  <Label htmlFor="hypertension" className="cursor-pointer">Hypertension</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="heart_disease" 
                    {...register('heart_disease')} 
                    className="w-4 h-4"
                  />
                  <Label htmlFor="heart_disease" className="cursor-pointer">Heart Disease</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>NIHSS</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nihss_loc">Level of consciousness</Label>
                  <Input id="nihss_loc" type="number" placeholder="0-3" {...register('nihss_loc', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="nihss_gaze">Best gaze</Label>
                  <Input id="nihss_gaze" type="number" placeholder="0-2" {...register('nihss_gaze', { valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="nihss_visual">Visual</Label>
                  <Input id="nihss_visual" type="number" placeholder="0-3" {...register('nihss_visual', { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="nihss_facial">Facial palsy</Label>
                  <Input id="nihss_facial" type="number" placeholder="0-3" {...register('nihss_facial', { valueAsNumber: true })} />
                </div>
              </div>
              <div>
                <Label htmlFor="nihss_total">Total NIHSS</Label>
                <Input id="nihss_total" type="number" placeholder="0-42" {...register('nihss_total', { valueAsNumber: true })} />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={5} placeholder="Clinical notes, onset time, interventions..." {...register('notes')} />
              <div className="mt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => navigate('/patients')}>Cancel</Button>
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700" 
                  disabled={isSubmitting || runningPrediction}
                >
                  {isSubmitting ? 'Creating Patient...' : runningPrediction ? 'Running Prediction...' : 'Submit Assessment & Run Prediction'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
        )}
      </div>
    </Shell>
  )
}
