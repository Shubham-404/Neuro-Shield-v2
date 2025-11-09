import React from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Input, Label, Textarea } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { useForm } from 'react-hook-form'
import { PageLoader } from '../components/ui/loader'
import { Patients } from '../services/api'

export default function ClinicalAssessmentPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async (data) => {
    try {
      // Map form data to patient structure
      const patientData = {
        name: data.name,
        age: data.age,
        gender: data.sex,
        medical_history: data.comorbidities,
        hypertension: data.hypertension || false,
        heart_disease: data.heart_disease || false,
        avg_glucose_level: data.avg_glucose_level || null,
        bmi: data.bmi || null,
        smoking_status: data.smoking_status || 'Unknown',
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
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="54" {...register('age', { valueAsNumber: true, min: 0 })} />
                </div>
                <div>
                  <Label htmlFor="sex">Sex</Label>
                  <Input id="sex" placeholder="Female" {...register('sex')} />
                </div>
              </div>
              <div>
                <Label htmlFor="comorbidities">Comorbidities</Label>
                <Input id="comorbidities" placeholder="HTN, DM2" {...register('comorbidities')} />
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
