import React from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Table, T, Th, Td } from '../components/ui/table'

export default function AnalyticsPage() {
  // TODO: Integrate analytics API and advanced charts
  const rows = [
    { k: 'AUC', v: 0.88 },
    { k: 'Sensitivity', v: '0.81 @ 0.5' },
    { k: 'Specificity', v: '0.79 @ 0.5' },
    { k: 'Calibration slope', v: 1.02 },
  ]
  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Model metrics</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <T>
                  <tbody>
                    {rows.map((r,i)=> (
                      <tr key={i}>
                        <Th className="w-1/2">{r.k}</Th>
                        <Td>{r.v}</Td>
                      </tr>
                    ))}
                  </tbody>
                </T>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Cohort overview</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Placeholder for calibration plot / PR curve.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
