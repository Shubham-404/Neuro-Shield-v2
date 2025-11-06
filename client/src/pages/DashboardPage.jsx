import React from 'react'
import { Link } from 'react-router-dom'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Table, T, Th, Td } from '../components/ui/table'
import { Progress } from '../components/ui/misc'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const lineData = [
  { name: 'Mon', risk: 12 },
  { name: 'Tue', risk: 18 },
  { name: 'Wed', risk: 22 },
  { name: 'Thu', risk: 16 },
  { name: 'Fri', risk: 26 },
  { name: 'Sat', risk: 19 },
  { name: 'Sun', risk: 14 },
]
const pieData = [
  { name: 'Low', value: 48, color: '#22c55e' },
  { name: 'Moderate', value: 34, color: '#eab308' },
  { name: 'High', value: 18, color: '#ef4444' },
]

export default function DashboardPage() {
  // TODO: Integrate API to fetch dashboard stats
  return (
    <Shell>
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Patients</CardTitle>
              <CardDescription>Total managed this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">284</div>
              <Progress value={72} className="mt-3" />
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>High-risk</CardTitle>
              <CardDescription>Flagged by model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">51</div>
              <Badge variant="destructive" className="mt-3">+4 today</Badge>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Requiring review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <Badge variant="warning" className="mt-3">3 critical</Badge>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Avg. risk score</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0.37</div>
              <div className="text-xs text-slate-500">Range 0-1</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Risk trend</CardTitle>
              <CardDescription>Daily average predicted risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="risk" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Risk distribution</CardTitle>
              <CardDescription>Current cohort</CardDescription>
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

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
                    <Th>NIHSS</Th>
                    <Th>Predicted risk</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5].map((id)=> (
                    <tr key={id}>
                      <Td>Patient #{id}</Td>
                      <Td>{40+id}</Td>
                      <Td>{(id*2)+3}</Td>
                      <Td>
                        <Badge variant={id%2? 'warning':'success'}>{id%2? 'Moderate':'Low'}</Badge>
                      </Td>
                      <Td>
                        <Link to={`/patients/${id}`}><Button size="sm" variant="outline">View</Button></Link>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </T>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}
