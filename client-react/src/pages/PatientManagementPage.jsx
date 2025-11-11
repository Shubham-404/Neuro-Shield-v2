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

  const exportToCSV = (data) => {
    try {
      // CSV headers
      const headers = ['Name', 'Age', 'Gender', 'Email', 'Risk Level', 'Hypertension', 'Heart Disease', 'BMI', 'Glucose Level', 'Smoking Status', 'Created Date']
      
      // CSV rows
      const rows = data.map(patient => [
        patient.name || 'N/A',
        patient.age || 'N/A',
        patient.gender || 'N/A',
        patient.email || 'N/A',
        patient.latest_risk_level || 'N/A',
        patient.hypertension ? 'Yes' : 'No',
        patient.heart_disease ? 'Yes' : 'No',
        patient.bmi || 'N/A',
        patient.avg_glucose_level || 'N/A',
        patient.smoking_status || 'N/A',
        patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'
      ])
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `patients_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Success', description: 'CSV file downloaded successfully', variant: 'success' }
      }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: 'Failed to export CSV', variant: 'destructive' }
      }))
    }
  }

  const exportToPDF = (data) => {
    try {
      // Create a simple HTML table for PDF
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Patient Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4f46e5; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .header { margin-bottom: 20px; }
            .date { color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Patient Management Report</h1>
            <p class="date">Generated: ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Risk Level</th>
                <th>Hypertension</th>
                <th>Heart Disease</th>
                <th>BMI</th>
                <th>Glucose Level</th>
              </tr>
            </thead>
            <tbody>
      `
      
      data.forEach(patient => {
        htmlContent += `
          <tr>
            <td>${patient.name || 'N/A'}</td>
            <td>${patient.age || 'N/A'}</td>
            <td>${patient.gender || 'N/A'}</td>
            <td>${patient.email || 'N/A'}</td>
            <td>${patient.latest_risk_level || 'N/A'}</td>
            <td>${patient.hypertension ? 'Yes' : 'No'}</td>
            <td>${patient.heart_disease ? 'Yes' : 'No'}</td>
            <td>${patient.bmi || 'N/A'}</td>
            <td>${patient.avg_glucose_level || 'N/A'}</td>
          </tr>
        `
      })
      
      htmlContent += `
            </tbody>
          </table>
        </body>
        </html>
      `
      
      // Open in new window and print
      const printWindow = window.open('', '_blank')
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      
      // Wait a bit then trigger print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
      
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Success', description: 'PDF export opened in print dialog', variant: 'success' }
      }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: 'Failed to export PDF', variant: 'destructive' }
      }))
    }
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
                <Button variant="outline" onClick={() => exportToCSV(patients)}>Export CSV</Button>
                <Button variant="outline" onClick={() => exportToPDF(patients)}>Export PDF</Button>
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
