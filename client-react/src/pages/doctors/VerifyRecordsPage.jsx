// client-react/src/pages/doctors/VerifyRecordsPage.jsx
import React, { useEffect, useState } from 'react'
import { Shell } from '../../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Textarea, Label } from '../../components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select'
import { Table, T, Th, Td } from '../../components/ui/table'
import { PatientFeatures } from '../../services/api'
import { PageLoader } from '../../components/ui/loader'
import { useAuth } from '../../contexts/AuthContext'
import { CheckCircle, XCircle, Clock, Eye, FileText, User, MessageSquare } from 'lucide-react'

export default function VerifyRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('pending')
  const { isAuthenticated, loading: authLoading, user } = useAuth()

  const [verificationData, setVerificationData] = useState({
    status: 'verified',
    notes: '',
    requested_info: ''
  })

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    fetchRecords()
  }, [authLoading, isAuthenticated, filterStatus])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      // For doctors, we need to get all pending records
      // This would typically be a separate endpoint, but for now we'll use a workaround
      // In a real implementation, you'd have a GET /patient-features/records/pending endpoint
      const response = await PatientFeatures.getRecords()
      if (response.data.success) {
        let allRecords = response.data.records || []
        
        // Filter by status if needed
        if (filterStatus !== 'all') {
          allRecords = allRecords.filter(r => r.verification_status === filterStatus)
        }
        
        setRecords(allRecords)
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: 'Failed to load records', variant: 'destructive' }
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = (record) => {
    setSelectedRecord(record)
    setVerificationData({
      status: record.verification_status === 'pending' ? 'verified' : record.verification_status,
      notes: record.doctor_notes || '',
      requested_info: ''
    })
    setShowVerifyModal(true)
  }

  const handleSubmitVerification = async (e) => {
    e.preventDefault()
    try {
      await PatientFeatures.verifyRecord(selectedRecord.id, verificationData)
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Success', description: 'Record verification updated', variant: 'success' }
      }))
      setShowVerifyModal(false)
      setSelectedRecord(null)
      fetchRecords()
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: err.response?.data?.message || 'Failed to verify record', variant: 'destructive' }
      }))
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>
      case 'rejected':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
      case 'needs_review':
        return <Badge variant="warning" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Needs Review</Badge>
      default:
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
    }
  }

  if (authLoading || loading) return <Shell><PageLoader show={true} /></Shell>

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Verify Medical Records</h1>
            <p className="text-slate-600 dark:text-slate-400">Review and verify patient medical records</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Records</CardTitle>
            <CardDescription>{records.length} record(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">No records found</p>
              </div>
            ) : (
              <Table>
                <T>
                  <thead>
                    <tr>
                      <Th>Patient</Th>
                      <Th>Title</Th>
                      <Th>Type</Th>
                      <Th>Date</Th>
                      <Th>Status</Th>
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <Td>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">Patient #{record.patient_id?.slice(0, 8)}</span>
                          </div>
                        </Td>
                        <Td className="font-medium">{record.title}</Td>
                        <Td><Badge variant="outline">{record.record_type}</Badge></Td>
                        <Td>{new Date(record.record_date).toLocaleDateString()}</Td>
                        <Td>{getStatusBadge(record.verification_status)}</Td>
                        <Td className="text-right">
                          <div className="flex justify-end gap-2">
                            {record.file_url && (
                              <Button variant="ghost" size="sm" onClick={() => window.open(record.file_url, '_blank')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => handleVerify(record)}>
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </div>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </T>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Verification Modal */}
        {showVerifyModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Verify Medical Record</CardTitle>
                <CardDescription>{selectedRecord.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Record Type</p>
                      <p className="font-medium capitalize">{selectedRecord.record_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Record Date</p>
                      <p className="font-medium">{new Date(selectedRecord.record_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {selectedRecord.description && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Description</p>
                      <p className="text-sm">{selectedRecord.description}</p>
                    </div>
                  )}
                  {selectedRecord.file_url && (
                    <div>
                      <Button variant="outline" onClick={() => window.open(selectedRecord.file_url, '_blank')}>
                        <FileText className="h-4 w-4 mr-2" />
                        View File
                      </Button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmitVerification} className="space-y-4">
                  <div>
                    <Label>Verification Status *</Label>
                    <Select
                      value={verificationData.status}
                      onValueChange={(val) => setVerificationData({ ...verificationData, status: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="needs_review">Needs Review</SelectItem>
                        <SelectItem value="needs_more_info">Needs More Information</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Notes / Comments</Label>
                    <Textarea
                      value={verificationData.notes}
                      onChange={(e) => setVerificationData({ ...verificationData, notes: e.target.value })}
                      placeholder="Add your notes or comments about this record"
                      rows={4}
                    />
                  </div>

                  {verificationData.status === 'needs_more_info' && (
                    <div>
                      <Label>Requested Information</Label>
                      <Textarea
                        value={verificationData.requested_info}
                        onChange={(e) => setVerificationData({ ...verificationData, requested_info: e.target.value })}
                        placeholder="What additional information is needed?"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setShowVerifyModal(false); setSelectedRecord(null) }}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit Verification</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Shell>
  )
}

