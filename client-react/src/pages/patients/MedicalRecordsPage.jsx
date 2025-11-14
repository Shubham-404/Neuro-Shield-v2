// client-react/src/pages/patients/MedicalRecordsPage.jsx
import React, { useEffect, useState } from 'react'
import { Shell } from '../../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input, Label, Textarea } from '../../components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select'
import { Table, T, Th, Td } from '../../components/ui/table'
import { PatientFeatures } from '../../services/api'
import { PageLoader } from '../../components/ui/loader'
import { useAuth } from '../../contexts/AuthContext'
import { Upload, FileText, CheckCircle, XCircle, Clock, Edit, Trash2, Eye } from 'lucide-react'
import { supabase } from '../../utils/supabaseClient'

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [uploading, setUploading] = useState(false)
  const { isAuthenticated, loading: authLoading, user } = useAuth()

  const [formData, setFormData] = useState({
    record_type: 'report',
    title: '',
    description: '',
    record_date: new Date().toISOString().split('T')[0],
    file: null
  })

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      console.log('[MedicalRecordsPage] Waiting for auth');
      return;
    }

    // Get patient_id from user object
    const patientId = user?.patient_id || (user?.role === 'patient' ? user?.id : null);
    
    if (!patientId) {
      console.error('[MedicalRecordsPage] No patient_id found:', user);
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: 'Patient ID not found', variant: 'destructive' }
      }))
      return;
    }

    console.log('[MedicalRecordsPage] Fetching records for patient:', patientId);
    fetchRecords()
  }, [authLoading, isAuthenticated, user])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const patientId = user?.patient_id || (user?.role === 'patient' ? user?.id : null);
      console.log('[MedicalRecordsPage] Fetching records, patientId:', patientId);
      
      if (!patientId) {
        throw new Error('Patient ID not available');
      }
      
      const response = await PatientFeatures.getRecords(patientId)
      if (response.data.success) {
        const records = response.data.records || [];
        console.log('[MedicalRecordsPage] Loaded', records.length, 'records');
        setRecords(records)
      } else {
        console.warn('[MedicalRecordsPage] Failed to load records:', response.data);
      }
    } catch (err) {
      console.error('[MedicalRecordsPage] Error fetching records:', err);
      if (err.response?.status !== 401) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: err.response?.data?.message || 'Failed to load records', variant: 'destructive' }
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // In a real app, upload to Supabase Storage first, then get URL
      // For now, we'll use a placeholder
      setFormData({ ...formData, file })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setUploading(true)

      let fileUrl = editingRecord?.file_url || null
      let fileType = editingRecord?.file_type || 'pdf'
      let fileSize = editingRecord?.file_size || 0

      // Upload file to Supabase Storage if a new file is provided
      if (formData.file && supabase) {
        try {
          const patientId = user?.patient_id || (user?.role === 'patient' ? user?.id : null);
          if (!patientId) {
            throw new Error('Patient ID not available for file upload');
          }
          
          console.log('[MedicalRecordsPage] Uploading file for patient:', patientId);
          const fileExt = formData.file.name.split('.').pop()
          const fileName = `${patientId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('medical-records')
            .upload(fileName, formData.file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            throw new Error(`File upload failed: ${uploadError.message}`)
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('medical-records')
            .getPublicUrl(fileName)

          fileUrl = publicUrl
          fileType = formData.file.type || fileExt
          fileSize = formData.file.size

          // If editing and there's an old file, delete it
          if (editingRecord?.file_url && editingRecord.file_url !== publicUrl) {
            const oldFileName = editingRecord.file_url.split('/').pop()
            await supabase.storage
              .from('medical-records')
              .remove([`${patientId}/${oldFileName}`])
          }
        } catch (uploadErr) {
          console.error('File upload error:', uploadErr)
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { title: 'Upload Error', description: uploadErr.message || 'Failed to upload file', variant: 'destructive' }
          }))
          setUploading(false)
          return
        }
      }

      const payload = {
        record_type: formData.record_type,
        title: formData.title,
        description: formData.description,
        record_date: formData.record_date,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize
      }

      if (editingRecord) {
        await PatientFeatures.updateRecord(editingRecord.id, payload)
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Success', description: 'Record updated successfully', variant: 'success' }
        }))
      } else {
        await PatientFeatures.uploadRecord(payload)
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Success', description: 'Record uploaded successfully', variant: 'success' }
        }))
      }

      setShowUploadModal(false)
      setEditingRecord(null)
      setFormData({
        record_type: 'report',
        title: '',
        description: '',
        record_date: new Date().toISOString().split('T')[0],
        file: null
      })
      fetchRecords()
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: err.response?.data?.message || 'Failed to save record', variant: 'destructive' }
      }))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      // Find the record to get file URL
      const record = records.find(r => r.id === id)
      
      // Delete file from storage if it exists
      if (record?.file_url && supabase) {
        try {
          const fileName = record.file_url.split('/').slice(-2).join('/') // Get patient_id/filename
          await supabase.storage
            .from('medical-records')
            .remove([fileName])
        } catch (storageErr) {
          console.warn('Failed to delete file from storage:', storageErr)
          // Continue with record deletion even if file deletion fails
        }
      }

      await PatientFeatures.deleteRecord(id)
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Success', description: 'Record deleted successfully', variant: 'success' }
      }))
      fetchRecords()
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: 'Failed to delete record', variant: 'destructive' }
      }))
    }
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setFormData({
      record_type: record.record_type,
      title: record.title,
      description: record.description || '',
      record_date: record.record_date || new Date().toISOString().split('T')[0],
      file: null
    })
    setShowUploadModal(true)
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
            <h1 className="text-2xl font-bold">Medical Records</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage your medical reports and documents</p>
          </div>
          <Button onClick={() => { setEditingRecord(null); setShowUploadModal(true) }}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Record
          </Button>
        </div>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Medical Records</CardTitle>
            <CardDescription>{records.length} record(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">No medical records yet</p>
                <Button onClick={() => setShowUploadModal(true)} className="mt-4">Upload Your First Record</Button>
              </div>
            ) : (
              <Table>
                <T>
                  <thead>
                    <tr>
                      <Th>Title</Th>
                      <Th>Type</Th>
                      <Th>Date</Th>
                      <Th>Status</Th>
                      <Th>Verified By</Th>
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id}>
                        <Td className="font-medium">{record.title}</Td>
                        <Td><Badge variant="outline">{record.record_type}</Badge></Td>
                        <Td>{new Date(record.record_date).toLocaleDateString()}</Td>
                        <Td>{getStatusBadge(record.verification_status)}</Td>
                        <Td>
                          {record.verified_by?.full_name ? (
                            <span className="text-sm">{record.verified_by.full_name}</span>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </Td>
                        <Td className="text-right">
                          <div className="flex justify-end gap-2">
                            {record.file_url && (
                              <Button variant="ghost" size="sm" onClick={() => window.open(record.file_url, '_blank')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
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

        {/* Upload/Edit Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>{editingRecord ? 'Edit Record' : 'Upload Medical Record'}</CardTitle>
                <CardDescription>Add a new medical report or document</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Record Type</Label>
                    <Select value={formData.record_type} onValueChange={(val) => setFormData({ ...formData, record_type: val })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="report">Report</SelectItem>
                        <SelectItem value="lab_result">Lab Result</SelectItem>
                        <SelectItem value="scan">Scan</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="e.g., Blood Test Report"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Additional details about this record"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Record Date</Label>
                    <Input
                      type="date"
                      value={formData.record_date}
                      onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
                    />
                  </div>

                  {!editingRecord && (
                    <div>
                      <Label>Upload File (PDF, Image)</Label>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                      {formData.file && (
                        <p className="text-sm text-slate-500 mt-1">Selected: {formData.file.name}</p>
                      )}
                    </div>
                  )}

                  {editingRecord && record.doctor_notes && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Doctor Notes:</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{record.doctor_notes}</p>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setShowUploadModal(false); setEditingRecord(null) }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? 'Saving...' : editingRecord ? 'Update' : 'Upload'}
                    </Button>
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

