// client-react/src/pages/patients/HealthLogsPage.jsx
import React, { useEffect, useState } from 'react'
import { Shell } from '../../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input, Label, Textarea } from '../../components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'
import { Table, T, Th, Td } from '../../components/ui/table'
import { PatientFeatures } from '../../services/api'
import { PageLoader } from '../../components/ui/loader'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Trash2, Edit, Calendar, List, Filter, Pill, Activity, Utensils, Moon, Heart, AlertCircle } from 'lucide-react'

export default function HealthLogsPage() {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingLog, setEditingLog] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [filterType, setFilterType] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const { isAuthenticated, loading: authLoading, user } = useAuth()

  const [formData, setFormData] = useState({
    log_type: 'symptom',
    title: '',
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    time: ''
  })

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      console.log('[HealthLogsPage] Waiting for auth');
      return;
    }

    const patientId = user?.patient_id || (user?.role === 'patient' ? user?.id : null);
    if (!patientId) {
      console.error('[HealthLogsPage] No patient_id found:', user);
      return;
    }

    console.log('[HealthLogsPage] Fetching logs for patient:', patientId);
    fetchLogs()
  }, [authLoading, isAuthenticated, user])

  useEffect(() => {
    applyFilters()
  }, [logs, filterType, dateFilter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const patientId = user?.patient_id || (user?.role === 'patient' ? user?.id : null);
      if (!patientId) {
        throw new Error('Patient ID not available');
      }
      
      console.log('[HealthLogsPage] Fetching logs, patientId:', patientId);
      const params = {}
      if (dateFilter) {
        const startDate = new Date(dateFilter)
        startDate.setDate(1) // First day of month
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + 1)
        params.start_date = startDate.toISOString().split('T')[0]
        params.end_date = endDate.toISOString().split('T')[0]
      }
      const response = await PatientFeatures.getLogs(patientId, params)
      if (response.data.success) {
        const logs = response.data.logs || [];
        console.log('[HealthLogsPage] Loaded', logs.length, 'logs');
        setLogs(logs)
      } else {
        console.warn('[HealthLogsPage] Failed to load logs:', response.data);
      }
    } catch (err) {
      console.error('[HealthLogsPage] Error fetching logs:', err);
      if (err.response?.status !== 401) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: err.response?.data?.message || 'Failed to load logs', variant: 'destructive' }
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...logs]

    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.log_type === filterType)
    }

    if (dateFilter) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.date)
        const filterDate = new Date(dateFilter)
        return logDate.getMonth() === filterDate.getMonth() && 
               logDate.getFullYear() === filterDate.getFullYear()
      })
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    setFilteredLogs(filtered)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const patientId = user?.patient_id || (user?.role === 'patient' ? user?.id : null);
      if (!patientId) {
        throw new Error('Patient ID not available');
      }
      
      console.log('[HealthLogsPage] Adding log for patient:', patientId);
      const payload = {
        patient_id: patientId,
        ...formData,
        date: formData.date || new Date().toISOString().split('T')[0]
      }

      if (editingLog) {
        await PatientFeatures.updateLog(editingLog.id, payload)
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Success', description: 'Log updated', variant: 'success' }
        }))
      } else {
        await PatientFeatures.addLog(payload)
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Success', description: 'Log added', variant: 'success' }
        }))
      }

      setShowAddModal(false)
      setEditingLog(null)
      setFormData({
        log_type: 'symptom',
        title: '',
        description: '',
        value: '',
        date: new Date().toISOString().split('T')[0],
        time: ''
      })
      fetchLogs()
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: err.response?.data?.message || 'Failed to save log', variant: 'destructive' }
      }))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this log?')) return
    try {
      await PatientFeatures.deleteLog(id)
      fetchLogs()
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: 'Failed to delete', variant: 'destructive' }
      }))
    }
  }

  const handleEdit = (log) => {
    setEditingLog(log)
    setFormData({
      log_type: log.log_type,
      title: log.title,
      description: log.description || '',
      value: log.value || '',
      date: log.date || new Date().toISOString().split('T')[0],
      time: log.time || ''
    })
    setShowAddModal(true)
  }

  const getLogIcon = (type) => {
    switch (type) {
      case 'medication': return <Pill className="h-4 w-4" />
      case 'symptom': return <AlertCircle className="h-4 w-4" />
      case 'exercise': return <Activity className="h-4 w-4" />
      case 'diet': return <Utensils className="h-4 w-4" />
      case 'sleep': return <Moon className="h-4 w-4" />
      case 'stress': return <Heart className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getLogTypeColor = (type) => {
    const colors = {
      medication: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      symptom: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      exercise: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      diet: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      sleep: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      stress: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      habit: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return colors[type] || colors.habit
  }

  const groupLogsByDate = () => {
    const grouped = {}
    filteredLogs.forEach(log => {
      const date = new Date(log.date).toLocaleDateString()
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(log)
    })
    return grouped
  }

  if (authLoading || loading) return <Shell><PageLoader show={true} /></Shell>

  const groupedLogs = viewMode === 'calendar' ? groupLogsByDate() : {}

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Health Logs</h1>
            <p className="text-slate-600 dark:text-slate-400">Track your symptoms, medications, and daily habits</p>
          </div>
          <Button onClick={() => { setEditingLog(null); setShowAddModal(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Log
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label>Filter by Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="symptom">Symptoms</SelectItem>
                    <SelectItem value="medication">Medications</SelectItem>
                    <SelectItem value="habit">Habits</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="diet">Diet</SelectItem>
                    <SelectItem value="sleep">Sleep</SelectItem>
                    <SelectItem value="stress">Stress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label>Filter by Month</Label>
                <Input
                  type="month"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div>
                <Button variant="outline" onClick={() => { setDateFilter(''); setFilterType('all') }}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Toggle */}
        <div className="flex justify-end">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="list" active={viewMode === 'list'}>
                <List className="h-4 w-4 mr-2" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar" active={viewMode === 'calendar'}>
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader>
              <CardTitle>Your Health Logs</CardTitle>
              <CardDescription>{filteredLogs.length} log(s) found</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-500">No logs found</p>
                  <Button onClick={() => setShowAddModal(true)} className="mt-4">Add Your First Log</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${getLogTypeColor(log.log_type)}`}>
                          {getLogIcon(log.log_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{log.title}</h4>
                            <Badge variant="outline" className="text-xs capitalize">{log.log_type}</Badge>
                          </div>
                          {log.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{log.description}</p>
                          )}
                          {log.value && (
                            <p className="text-sm text-slate-500 mb-1">
                              <span className="font-medium">Value:</span> {log.value}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{new Date(log.date).toLocaleDateString()}</span>
                            {log.time && <span>{log.time}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(log)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(log.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="space-y-4">
            {Object.keys(groupedLogs).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-500">No logs found for selected period</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedLogs).map(([date, dateLogs]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="text-lg">{date}</CardTitle>
                    <CardDescription>{dateLogs.length} log(s)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {dateLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${getLogTypeColor(log.log_type)}`}>
                              {getLogIcon(log.log_type)}
                            </div>
                            <div>
                              <p className="font-medium">{log.title}</p>
                              {log.value && <p className="text-sm text-slate-500">{log.value}</p>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(log)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(log.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>{editingLog ? 'Edit Log' : 'Add Health Log'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Log Type *</Label>
                    <Select
                      value={formData.log_type}
                      onValueChange={(val) => setFormData({ ...formData, log_type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="symptom">Symptom</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="habit">Habit</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="diet">Diet</SelectItem>
                        <SelectItem value="sleep">Sleep</SelectItem>
                        <SelectItem value="stress">Stress</SelectItem>
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
                      placeholder="e.g., Morning Headache"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Additional details"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Value</Label>
                    <Input
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="e.g., 500mg, 30 minutes, 8 hours"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date *</Label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditingLog(null) }}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingLog ? 'Update' : 'Add'}</Button>
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

