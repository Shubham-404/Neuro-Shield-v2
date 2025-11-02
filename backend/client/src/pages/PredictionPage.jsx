import React from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

export default function PredictionPage() {
  // TODO: Fetch prediction result, SHAP values, and recommendations via API
  const features = [
    { name: 'NIHSS', impact: 0.24 },
    { name: 'Age', impact: 0.15 },
    { name: 'SBP', impact: 0.09 },
    { name: 'Onset-to-door', impact: 0.07 },
    { name: 'mRS', impact: 0.05 },
  ]

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Prediction summary</h1>
          <div className="flex gap-2">
            <Button variant="outline">Re-run</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Risk score</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-5xl font-extrabold text-amber-600">0.62</div>
                  <div className="text-sm text-slate-500">Moderate risk</div>
                </div>
                <Badge variant="warning">Threshold 0.55</Badge>
              </div>
              <div className="mt-6">
                <div className="text-sm font-medium mb-2">Top contributing features (SHAP)</div>
                <div className="space-y-2">
                  {features.map((f, i) => (
                    <div key={i} className="grid grid-cols-5 items-center gap-3">
                      <div className="col-span-2 text-sm text-slate-600">{f.name}</div>
                      <div className="col-span-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-purple-600" style={{ width: `${f.impact * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
            <CardContent className="text-sm text-slate-600 space-y-2">
              <p>• Consider CT angiography if not yet performed.</p>
              <p>• Monitor BP; target 180/105 prior to thrombolysis.</p>
              <p>• Frequent neuro checks q15min x 2h.</p>
              <p className="text-xs text-slate-400">Generated suggestions; not a substitute for clinical judgment.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
