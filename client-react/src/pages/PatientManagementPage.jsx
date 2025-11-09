import React, { useEffect, useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input, Label } from '../components/ui/input'
import { Table, T, Th, Td } from '../components/ui/table'
import { Link } from 'react-router-dom'
import { Patients } from '../services/api'
import { PageLoader } from '../components/ui/loader'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'

export default function PatientManagementPage() {
  const [q, setQ] = useState('')
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isAuthenticated, loading: authLoading } = useAuth()

  useEffect(() => {
    // Wait for auth to be ready before making API calls
    if (authLoading || !isAuthenticated) {
      return
    }

    const fetchPatients = async () => {
      try {
        setLoading(true)
        const response = await Patients.list()
        if (response.data.success) {
          setPatients(response.data.patients || [])
        } else {
          setError('Failed to load patients')
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          setError(err.response?.data?.message || 'Failed to load patients')
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { title: 'Error', description: 'Failed to load patients', variant: 'destructive' }
          }))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchPatients()
  }, [authLoading, isAuthenticated])

  const filtered = patients.filter(p => {
    const searchTerm = q.toLowerCase()
    return (
      (p.name?.toLowerCase().includes(searchTerm)) ||
      (p.email?.toLowerCase().includes(searchTerm)) ||
      (p.id?.toString().includes(searchTerm))
    )
  })

  const getRiskBadge = (risk) => {
    if (risk === 'High') return <Badge variant="destructive">High</Badge>
    if (risk === 'Moderate') return <Badge variant="warning">Moderate</Badge>
    return <Badge variant="success">Low</Badge>
  }

  if (authLoading || loading) return <Shell><PageLoader show={true} /></Shell>
  if (error) return <Shell><div className="p-6 text-red-600">{error}</div></Shell>

  return (
    <Shell>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="w-full md:w-72">
                <Label htmlFor="q">Search</Label>
                <Input id="q" value={q} onChange={(e)=> setQ(e.target.value)} placeholder="Search patients..." />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('toast', { detail: { title: 'Export CSV', description: 'Downloading CSV...', } }))}>Export CSV</Button>
                <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('toast', { detail: { title: 'Export PDF', description: 'Server-side export coming soon', } }))}>Export PDF</Button>
                <Link to="/assessment"><Button className="bg-indigo-600 hover:bg-indigo-700">Add Patient</Button></Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Table>
              <T>
                <thead>
                  <tr>
                    <Th>Name</Th>
                    <Th>Age</Th>
                    <Th>Email</Th>
                    <Th>Risk</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <Td colSpan={5} className="text-center text-slate-500 py-8">
                        {q ? 'No patients found matching your search' : 'No patients yet. Add your first patient!'}
                      </Td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-white/5">
                        <Td>{p.name || 'N/A'}</Td>
                        <Td>{p.age || 'N/A'}</Td>
                        <Td>{p.email || 'N/A'}</Td>
                        <Td>{getRiskBadge(p.latest_risk_level)}</Td>
                      <Td className="text-right">
                        <Link className="text-blue-600 hover:underline" to={`/patients/${p.id}`}>View</Link>
                      </Td>
                    </tr>
                    ))
                  )}
                </tbody>
              </T>
            </Table>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <div>Showing {filtered.length} of {patients.length}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  )
}
