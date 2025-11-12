import React, { useEffect, useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card'
import { Table, T, Th, Td } from '../components/ui/table'
import { Analytics } from '../services/api'
import { PageLoader } from '../components/ui/loader'
import { useAuth } from '../contexts/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isAuthenticated, loading: authLoading } = useAuth()

  useEffect(() => {
    // Wait for auth to be ready before making API calls
    if (authLoading || !isAuthenticated) {
      return
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await Analytics.getDashboard()
        if (response.data.success) {
          setStats(response.data.summary)
          setCharts(response.data.charts)
        } else {
          setError('Failed to load analytics')
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          setError(err.response?.data?.message || 'Failed to load analytics')
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { title: 'Error', description: 'Failed to load analytics', variant: 'destructive' }
          }))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [authLoading, isAuthenticated])


  if (authLoading || loading) return <Shell><PageLoader show={true} /></Shell>
  if (error) return <Shell><div className="p-6 text-red-600">{error}</div></Shell>

  const COLORS = ['#22c55e', '#eab308', '#ef4444']

  return (
    <Shell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        
        {/* Overall Analytics Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Overall Analytics</h2>
          
          {/* Charts */}
          {charts && (
            <>
              {/* Patient Trends */}
              {charts.patientTrends && charts.patientTrends.length > 0 && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Patient Trends (Last 30 Days)</CardTitle>
                    <CardDescription>Risk level changes over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={charts.patientTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="high" stroke="#ef4444" strokeWidth={2} name="High Risk" />
                          <Line type="monotone" dataKey="moderate" stroke="#eab308" strokeWidth={2} name="Moderate Risk" />
                          <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} name="Low Risk" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Demographics */}
              <div className="grid lg:grid-cols-2 gap-4">
                {charts.ageDistribution && charts.ageDistribution.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Age Distribution</CardTitle>
                      <CardDescription>Patient age groups</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={charts.ageDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {charts.genderDistribution && charts.genderDistribution.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Gender Distribution</CardTitle>
                      <CardDescription>Patient demographics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={charts.genderDistribution}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {charts.genderDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899'][index % 3]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Shell>
  )
}
