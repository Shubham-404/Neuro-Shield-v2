import React, { useEffect, useState } from 'react'
import { Shell } from '../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input, Label } from '../components/ui/input'
import { Table, T, Th, Td } from '../components/ui/table'
import { Link } from 'react-router-dom'
import { Patients, Predictions } from '../services/api'
import { PageLoader } from '../components/ui/loader'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PatientManagementPage() {
  const [q, setQ] = useState('')
  const [patients, setPatients] = useState([])
  const [patientRiskLevels, setPatientRiskLevels] = useState({}) // Map patient_id -> risk_level
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
          const patientsList = response.data.patients || []
          setPatients(patientsList)

          // Fetch latest prediction for each patient (similar to PatientDetailPage)
          const riskLevelMap = {}
          await Promise.all(
            patientsList.map(async (patient) => {
              try {
                const predResponse = await Predictions.getHistory(patient.id)
                if (predResponse.data.success && predResponse.data.predictions && predResponse.data.predictions.length > 0) {
                  // Get the latest prediction (first one in the array, as in PatientDetailPage)
                  const latestPrediction = predResponse.data.predictions[0]
                  riskLevelMap[patient.id] = latestPrediction.risk_level
                }
              } catch (err) {
                // If prediction fetch fails for a patient, just skip it
                console.error(`Failed to fetch prediction for patient ${patient.id}:`, err)
              }
            })
          )
          setPatientRiskLevels(riskLevelMap)
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
    if (!risk || risk === 'N/A' || risk === 'NA') return <Badge variant="outline">No Risk/Low</Badge>
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
      link.setAttribute('download', `patients_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)


      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Success', description: 'CSV file downloaded successfully', variant: 'success' }
      }))
    } catch (err) {
      console.error('CSV export error:', err)
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: 'Failed to export CSV', variant: 'destructive' }
      }))
    }
  }

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(18)
      doc.text('Patient Management Report', 14, 22)
      doc.setFontSize(11)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)
      doc.text(`Total Patients: ${filtered.length}`, 14, 36)

      // Prepare table data
      const tableData = filtered.map((p) => {
        const riskLevel = patientRiskLevels[p.id] || 'No prediction'
        return [
          p.name || 'N/A',
          p.age || 'N/A',
          p.email || 'N/A',
          p.gender || 'N/A',
          riskLevel,
          p.hypertension ? 'Yes' : 'No',
          p.heart_disease ? 'Yes' : 'No',
          p.bmi ? p.bmi.toFixed(1) : 'N/A',
          p.avg_glucose_level ? p.avg_glucose_level.toFixed(1) : 'N/A',
          p.smoking_status || 'N/A'
        ]
      })

      // Add table using autoTable function directly
      autoTable(doc, {
        head: [['Name', 'Age', 'Email', 'Gender', 'Risk Level', 'Hypertension', 'Heart Disease', 'BMI', 'Avg Glucose', 'Smoking Status']],
        body: tableData,
        startY: 42,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 42 }
      })

      // Save PDF
      doc.save(`patients_export_${new Date().toISOString().split('T')[0]}.pdf`)

      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Success', description: 'PDF file downloaded successfully', variant: 'success' }
      }))
    } catch (err) {
      console.error('PDF export error:', err)
      // Show detailed error for debugging
      const errorMessage = err.message || err.toString() || 'Unknown error'
      console.error('Full error details:', err)

      // If jspdf is not installed, show helpful error
      if (errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('MODULE_NOT_FOUND') ||
        errorMessage.includes('Cannot find module')) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: {
            title: 'Error',
            description: 'PDF export requires jspdf library. Please install it: npm install jspdf jspdf-autotable',
            variant: 'destructive'
          }
        }))
      } else {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: {
            title: 'Error',
            description: `Failed to export PDF: ${errorMessage.substring(0, 50)}`,
            variant: 'destructive'
          }
        }))
      }
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
                <Input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patients..." />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportToCSV} disabled={filtered.length === 0}>Export CSV</Button>
                <Button variant="outline" onClick={exportToPDF} disabled={filtered.length === 0}>Export PDF</Button>
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
                    filtered.map((p) => {
                      // Get risk level from fetched predictions (same approach as PatientDetailPage)
                      const riskLevel = patientRiskLevels[p.id] || null
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-white/5">
                          <Td>{p.name || 'N/A'}</Td>
                          <Td>{p.age || 'N/A'}</Td>
                          <Td>{p.email || 'N/A'}</Td>
                          <Td>{riskLevel ? getRiskBadge(riskLevel) : <span className="text-slate-400 text-sm">No prediction</span>}</Td>
                          <Td className="text-right">
                            <Link className="text-blue-600 hover:underline" to={`/patients/${p.id}`}>View</Link>
                          </Td>
                        </tr>
                      )
                    })
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
