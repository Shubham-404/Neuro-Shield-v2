import React from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export default function AlertsPage() {
  // TODO: Fetch alerts from API and support triage actions
  const alerts = [
    { id: 1, level: 'critical', title: 'High-risk prediction 0.92', meta: 'Patient #45 • 5m ago' },
    { id: 2, level: 'warning', title: 'Missing NIHSS value', meta: 'Patient #12 • 14m ago' },
    { id: 3, level: 'info', title: 'Model update available', meta: 'System • 1h ago' },
  ]
  const color = (lvl) => lvl==='critical' ? 'destructive' : lvl==='warning' ? 'warning' : 'gray'

  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <Card>
          <CardHeader><CardTitle>Recent</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {alerts.map(a => (
              <div key={a.id} className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-slate-50/60 dark:hover:bg-white/5">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <Badge variant={color(a.level)} className="capitalize">{a.level}</Badge>
                    {a.title}
                  </div>
                  <div className="text-xs text-slate-500">{a.meta}</div>
                </div>
                <div className="text-sm text-blue-600 hover:underline"><a href="/patients/45">View</a></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}
