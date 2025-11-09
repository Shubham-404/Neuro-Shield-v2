import React from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Link } from 'react-router-dom'

export default function PatientDetailPage() {
  const [tab, setTab] = React.useState('overview')

  // TODO: Fetch patient details by ID param
  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Patient #123</h1>
            <p className="text-sm text-slate-500">DOB 1975-08-28 • MRN 998877</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {['overview', 'assessments', 'predictions', 'documents'].map((k) => (
              <TabsTrigger key={k} active={tab === k} onClick={() => setTab(k)}>{k[0].toUpperCase() + k.slice(1)}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent>
            {tab === 'overview' && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader><CardTitle>Demographics</CardTitle></CardHeader>
                  <CardContent className="text-sm text-slate-600 space-y-1">
                    <div>Sex: Female</div>
                    <div>Age: 54</div>
                    <div>Comorbidities: HTN, DM2</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Latest vitals</CardTitle></CardHeader>
                  <CardContent className="text-sm text-slate-600 space-y-1">
                    <div>BP: 152/90</div>
                    <div>HR: 88</div>
                    <div>SpO2: 97%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Current risk</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-amber-600">Moderate</div>
                    <div className="text-xs text-slate-500">Last updated 10m ago</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === 'assessments' && (
              <Card>
                <CardContent>
                  <p className="text-sm">NIHSS 11 • mRS 2 • GCS 14</p>
                </CardContent>
              </Card>
            )}

            {tab === 'predictions' && (
              <Card>
                <CardContent>
                  <p className="text-sm">Model v1.3 • AUC 0.88 • Calibration good</p>
                </CardContent>
              </Card>
            )}

            {tab === 'documents' && (
              <Card>
                <CardContent>
                  <ul className="list-disc pl-5 text-sm text-slate-600">
                    <li>CT report.pdf</li>
                    <li>Admission note.pdf</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  )
}
