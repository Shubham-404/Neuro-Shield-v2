import React, { useEffect, useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Table, T, Th, Td } from '../components/ui/table'
import { Analytics } from '../services/api'
import { PageLoader } from '../components/ui/loader'

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await Analytics.getDashboard()
        if (response.data.success) {
          setStats(response.data.summary)
        } else {
          setError('Failed to load analytics')
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics')
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: 'Failed to load analytics', variant: 'destructive' }
        }))
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) return <Shell><PageLoader show={true} /></Shell>
  if (error) return <Shell><div className="p-6 text-red-600">{error}</div></Shell>

  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Dashboard Summary</CardTitle></CardHeader>
            <CardContent>
              {stats ? (
                <Table>
                  <T>
                    <tbody>
                      <tr>
                        <Th className="w-1/2">Total Patients</Th>
                        <Td>{stats.total_patients || 0}</Td>
                      </tr>
                      <tr>
                        <Th>High Risk</Th>
                        <Td className="text-red-600 font-semibold">{stats.high_risk || 0}</Td>
                      </tr>
                      <tr>
                        <Th>Moderate Risk</Th>
                        <Td className="text-amber-600 font-semibold">{stats.moderate_risk || 0}</Td>
                      </tr>
                      <tr>
                        <Th>Low Risk</Th>
                        <Td className="text-green-600 font-semibold">{stats.low_risk || 0}</Td>
                      </tr>
                    </tbody>
                  </T>
                </Table>
              ) : (
                <p className="text-sm text-slate-600">No data available</p>
              )}
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
