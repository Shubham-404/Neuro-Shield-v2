import React from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Input, Label, Textarea } from '../components/ui/input'
import { Button } from '../components/ui/button'

export default function ClinicalAssessmentPage() {
  // TODO: Submit form to API
  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Clinical assessment</h1>

        <form className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Patient info</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Full name</Label>
                <Input placeholder="Jane Doe" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Age</Label>
                  <Input type="number" placeholder="54" />
                </div>
                <div>
                  <Label>Sex</Label>
                  <Input placeholder="Female" />
                </div>
              </div>
              <div>
                <Label>Comorbidities</Label>
                <Input placeholder="HTN, DM2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>NIHSS</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Level of consciousness</Label>
                  <Input type="number" placeholder="0-3" />
                </div>
                <div>
                  <Label>Best gaze</Label>
                  <Input type="number" placeholder="0-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Visual</Label>
                  <Input type="number" placeholder="0-3" />
                </div>
                <div>
                  <Label>Facial palsy</Label>
                  <Input type="number" placeholder="0-3" />
                </div>
              </div>
              <div>
                <Label>Total NIHSS</Label>
                <Input type="number" placeholder="0-42" />
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea rows={5} placeholder="Clinical notes, onset time, interventions..." />
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
