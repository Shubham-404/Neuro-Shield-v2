import React from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card'
import { Table, T, Th, Td } from '../components/ui/table'

export default function StaffDashboardPage() {
  // TODO: Replace with staff-specific KPIs fetched from API
  const tasks = [
    { id: 1, title: 'Verify NIHSS entries', due: 'Today' },
    { id: 2, title: 'Follow up lab results', due: 'Today' },
    { id: 3, title: 'Schedule imaging', due: 'Tomorrow' },
  ]
  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Staff Dashboard</h1>
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Work queue</CardTitle>
              <CardDescription>Today’s priorities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <T>
                  <tbody>
                    {tasks.map(t => (
                      <tr key={t.id}>
                        <Td>{t.title}</Td>
                        <Td className="text-right text-sm text-slate-500">{t.due}</Td>
                      </tr>
                    ))}
                  </tbody>
                </T>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              <p>Model v1.4 scheduled for rollout next week.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
