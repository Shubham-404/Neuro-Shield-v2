import React from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Input, Label, Textarea } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select'
import { useForm } from 'react-hook-form'
import { PageLoader } from '../components/ui/loader'
import { Patients } from '../services/api'

export default function ClinicalAssessmentPage() {
  const { register, handleSubmit, formState: { isSubmitting }, watch, setValue } = useForm()
  const smokingStatus = watch('smoking_status')
  const gender = watch('gender')
  const everMarried = watch('ever_married')
  const workType = watch('work_type')
  const residenceType = watch('residence_type')

  const onSubmit = async (data) => {
    try {
      // Map form data to patient structure
      const patientData = {
        name: data.name,
        age: data.age,
        gender: data.gender || 'Male', // Fixed: use 'gender' instead of 'sex'
        medical_history: data.comorbidities,
        hypertension: data.hypertension || false,
        heart_disease: data.heart_disease || false,
        avg_glucose_level: data.avg_glucose_level || null,
        bmi: data.bmi || null,
        smoking_status: data.smoking_status || 'Unknown',
        // ML prediction required fields
        ever_married: data.ever_married || true,
        work_type: data.work_type || 'Private',
        residence_type: data.residence_type || 'Urban',
        // Additional clinical data
        nihss_total: data.nihss_total || null,
        notes: data.notes
      }

      const response = await Patients.create(patientData)
      if (response.data.success) {
        window.dispatchEvent(new CustomEvent('toast', { 
          detail: { title: 'Patient created', description: 'Patient assessment saved successfully.', variant: 'success' } 
        }))
        // Redirect to patient detail page
        window.location.href = `/patients/${response.data.patient.id}`
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

  return (
    <Shell>
      <PageLoader show={isSubmitting} />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Clinical assessment</h1>

        <form className="grid lg:grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Card>
            <CardHeader><CardTitle>Patient info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Jane Doe" {...register('name', { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input id="age" type="number" placeholder="54" {...register('age', { valueAsNumber: true, required: true, min: 0 })} />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={gender || 'Male'} onValueChange={(val) => setValue('gender', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('gender', { required: true })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ever_married">Ever Married *</Label>
                  <Select value={everMarried !== undefined ? (everMarried ? 'Yes' : 'No') : 'Yes'} onValueChange={(val) => setValue('ever_married', val === 'Yes')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('ever_married', { value: true })} />
                </div>
                <div>
                  <Label htmlFor="residence_type">Residence Type *</Label>
                  <Select value={residenceType || 'Urban'} onValueChange={(val) => setValue('residence_type', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select residence type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Urban">Urban</SelectItem>
                      <SelectItem value="Rural">Rural</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" {...register('residence_type', { value: 'Urban' })} />
                </div>
              </div>
              <div>
                <Label htmlFor="work_type">Work Type *</Label>
                <Select value={workType || 'Private'} onValueChange={(val) => setValue('work_type', val)}>
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
                <input type="hidden" {...register('work_type', { value: 'Private' })} />
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
                </div>
              </div>
              <div>
                <Label htmlFor="smoking_status">Smoking Status *</Label>
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
                <Button type="button" variant="outline">Save draft</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Submit assessment</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Shell>
  )
}
