import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Table, T, Th, Td } from '../components/ui/table'
import { Progress } from '../components/ui/misc'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Analytics } from '../services/api'
import { PageLoader } from '../components/ui/loader'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, loading: authLoading, user } = useAuth()

  useEffect(() => {
    // Wait for auth to be ready before making API calls
    if (authLoading || !isAuthenticated) {
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const statsRes = await Analytics.getDashboard()
        if (statsRes.data.success) {
          // Use only real data from backend - no hardcoded values
          setStats(statsRes.data.summary || {})
          setCharts(statsRes.data.charts || {})
        }
      } catch (err) {
        // Only show error if it's not a 401 (handled by interceptor)
        if (err.response?.status !== 401) {
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { title: 'Error', description: 'Failed to load dashboard', variant: 'destructive' }
          }))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [authLoading, isAuthenticated])

  if (authLoading || loading) return <Shell><PageLoader show={true} /></Shell>

  const totalPatients = stats?.total_patients || 0
  const highRisk = stats?.high_risk || 0
  const moderateRisk = stats?.moderate_risk || 0
  const lowRisk = stats?.low_risk || 0

  const pieData = charts?.riskDistribution || [
    { name: 'Low', value: lowRisk, color: '#22c55e' },
    { name: 'Moderate', value: moderateRisk, color: '#eab308' },
    { name: 'High', value: highRisk, color: '#ef4444' },
  ].filter(item => item.value > 0)

  const getRiskBadge = (risk) => {
    if (risk === 'High') return <Badge variant="destructive">High</Badge>
    if (risk === 'Moderate') return <Badge variant="warning">Moderate</Badge>
    return <Badge variant="success">Low</Badge>
  }

  return (
    <Shell>
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Patients</CardTitle>
              <CardDescription>Total managed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPatients}</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>High-risk</CardTitle>
              <CardDescription>Flagged by model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{highRisk}</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Moderate Risk</CardTitle>
              <CardDescription>Requiring monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{moderateRisk}</div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Low Risk</CardTitle>
              <CardDescription>Standard care</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{lowRisk}</div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Health Overview */}
        {user?.role === 'patient' && (
          <>
            {pieData.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Risk Level</CardTitle>
                    <CardDescription>Current health assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {pieData.map((e, i) => (
                              <Cell key={i} fill={e.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {charts?.patientTrends && charts.patientTrends.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Health Trends</CardTitle>
                      <CardDescription>Your risk level over time</CardDescription>
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
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Your Health Summary</CardTitle>
                <CardDescription>Overview of your medical information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Current Risk Level</p>
                    <p className="text-2xl font-bold">
                      {highRisk > 0 ? 'High' : moderateRisk > 0 ? 'Moderate' : 'Low'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Total Assessments</p>
                    <p className="text-2xl font-bold">{totalPatients}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Doctor View - Patient Management */}
        {user?.role !== 'patient' && (
          <>
            {pieData.length > 0 && (
              <div className="grid lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Risk Distribution</CardTitle>
                    <CardDescription>Current patient cohort</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} paddingAngle={4}>
                            {pieData.map((e, i) => (
                              <Cell key={i} fill={e.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Breakdown</CardTitle>
                    <CardDescription>By category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pieData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm">{item.name}</span>
                          </div>
                          <span className="font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {charts?.patientTrends && charts.patientTrends.length > 0 && (
              <Card>
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
          </>
        )}
      </div>
    </Shell>
  )
}
