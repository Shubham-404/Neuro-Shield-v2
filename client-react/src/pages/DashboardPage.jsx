import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Table, T, Th, Td } from '../components/ui/table'
import { Progress } from '../components/ui/misc'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Analytics, Patients } from '../services/api'
import { PageLoader } from '../components/ui/loader'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsRes, patientsRes] = await Promise.all([
          Analytics.getDashboard(),
          Patients.list()
        ])
        if (statsRes.data.success) {
          setStats(statsRes.data.summary)
        }
        if (patientsRes.data.success) {
          // Get recent 5 patients
          setPatients((patientsRes.data.patients || []).slice(0, 5))
        }
      } catch (err) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: 'Failed to load dashboard', variant: 'destructive' }
        }))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Shell><PageLoader show={true} /></Shell>

  const totalPatients = stats?.total_patients || 0
  const highRisk = stats?.high_risk || 0
  const moderateRisk = stats?.moderate_risk || 0
  const lowRisk = stats?.low_risk || 0

  const pieData = [
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

        <Card>
          <CardHeader>
            <CardTitle>Recent patients</CardTitle>
            <CardDescription>Quick overview of latest activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <T>
                <thead>
                  <tr>
                    <Th>Patient</Th>
                    <Th>Age</Th>
                    <Th>Email</Th>
                    <Th>Risk</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <Td colSpan={5} className="text-center text-slate-500 py-8">No patients yet</Td>
                    </tr>
                  ) : (
                    patients.map((p) => (
                      <tr key={p.id}>
                        <Td>{p.name || 'N/A'}</Td>
                        <Td>{p.age || 'N/A'}</Td>
                        <Td>{p.email || 'N/A'}</Td>
                        <Td>{getRiskBadge(p.latest_risk_level)}</Td>
                        <Td>
                          <Link to={`/patients/${p.id}`}><Button size="sm" variant="outline">View</Button></Link>
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </T>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}
