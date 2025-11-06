import React from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'

export default function AdminAnalyticsPage() {
  // TODO: Wire to admin metrics API
  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Admin Analytics Panel</h1>
        <div className="grid lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Users</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">142</div>
              <div className="text-xs text-slate-500">Total active</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Hospitals</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">28</div>
              <div className="text-xs text-slate-500">Connected orgs</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Model versions</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <div className="text-xs text-slate-500">Deployed</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}
