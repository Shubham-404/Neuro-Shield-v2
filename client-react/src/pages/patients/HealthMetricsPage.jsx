// client-react/src/pages/patients/HealthMetricsPage.jsx
import React, { useEffect, useState } from 'react'
import { Shell } from '../../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input, Label } from '../../components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select'
import { PatientFeatures } from '../../services/api'
import { PageLoader } from '../../components/ui/loader'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Trash2, Edit, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function HealthMetricsPage() {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMetric, setEditingMetric] = useState(null)
  const { isAuthenticated, loading: authLoading, user } = useAuth()

  const [formData, setFormData] = useState({
    metric_type: 'blood_pressure',
    value: '',
    unit: '',
    notes: '',
    recorded_at: new Date().toISOString()
  })

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      console.log('[HealthMetricsPage] Waiting for auth');
      return;
    }

    const patientId = user?.patient_id || (user?.role === 'patient' ? user?.id : null);
    if (!patientId) {
      console.error('[HealthMetricsPage] No patient_id found:', user);
      return;
    }

    console.log('[HealthMetricsPage] Fetching metrics for patient:', patientId);
    fetchMetrics()
  }, [authLoading, isAuthenticated, user])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const patientId = user?.patient_id || (user?.role === 'patient' ? user?.id : null);
      if (!patientId) {
        throw new Error('Patient ID not available');
      }
      
      console.log('[HealthMetricsPage] Fetching metrics, patientId:', patientId);
      const response = await PatientFeatures.getMetrics(patientId)
      if (response.data.success) {
        const metrics = response.data.metrics || [];
        console.log('[HealthMetricsPage] Loaded', metrics.length, 'metrics');
        setMetrics(metrics)
      } else {
        console.warn('[HealthMetricsPage] Failed to load metrics:', response.data);
      }
    } catch (err) {
      console.error('[HealthMetricsPage] Error fetching metrics:', err);
      if (err.response?.status !== 401) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: err.response?.data?.message || 'Failed to load metrics', variant: 'destructive' }
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const patientId = user?.patient_id || (user?.role === 'patient' ? user?.id : null);
      if (!patientId) {
        throw new Error('Patient ID not available');
      }
      
      console.log('[HealthMetricsPage] Adding metric for patient:', patientId);
      const payload = {
        patient_id: patientId,
        ...formData,
        value: parseFloat(formData.value),
        recorded_at: new Date(formData.recorded_at).toISOString()
      }

      if (editingMetric) {
        await PatientFeatures.updateMetric(editingMetric.id, payload)
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Success', description: 'Metric updated', variant: 'success' }
        }))
      } else {
        await PatientFeatures.addMetric(payload)
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Success', description: 'Metric added', variant: 'success' }
        }))
      }

      setShowAddModal(false)
      setEditingMetric(null)
      setFormData({
        metric_type: 'blood_pressure',
        value: '',
        unit: '',
        notes: '',
        recorded_at: new Date().toISOString()
      })
      fetchMetrics()
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: err.response?.data?.message || 'Failed to save metric', variant: 'destructive' }
      }))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this metric?')) return
    try {
      await PatientFeatures.deleteMetric(id)
      fetchMetrics()
    } catch (err) {
      window.dispatchEvent(new CustomEvent('toast', {
        detail: { title: 'Error', description: 'Failed to delete', variant: 'destructive' }
      }))
    }
  }

  const getDefaultUnit = (type) => {
    const units = {
      blood_pressure: 'mmHg',
      blood_sugar: 'mg/dL',
      weight: 'kg',
      bmi: '',
      heart_rate: 'bpm',
      temperature: '°C'
    }
    return units[type] || ''
  }

  const chartData = metrics
    .filter(m => m.metric_type === 'blood_pressure' || m.metric_type === 'blood_sugar')
    .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at))
    .map(m => ({
      date: new Date(m.recorded_at).toLocaleDateString(),
      [m.metric_type]: m.value
    }))

  if (authLoading || loading) return <Shell><PageLoader show={true} /></Shell>

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Health Metrics</h1>
            <p className="text-slate-600 dark:text-slate-400">Track your vital signs and health measurements</p>
          </div>
          <Button onClick={() => { setEditingMetric(null); setShowAddModal(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Metric
          </Button>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="blood_pressure" stroke="#8884d8" name="Blood Pressure" />
                  <Line type="monotone" dataKey="blood_sugar" stroke="#82ca9d" name="Blood Sugar" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Metrics List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No metrics recorded yet</p>
              ) : (
                metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold capitalize">{metric.metric_type.replace('_', ' ')}</p>
                        <p className="text-sm text-slate-500">
                          {metric.value} {metric.unit} • {new Date(metric.recorded_at).toLocaleDateString()}
                        </p>
                        {metric.notes && <p className="text-sm text-slate-400 mt-1">{metric.notes}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingMetric(metric); setFormData(metric); setShowAddModal(true) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(metric.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{editingMetric ? 'Edit Metric' : 'Add Health Metric'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Metric Type</Label>
                    <Select
                      value={formData.metric_type}
                      onValueChange={(val) => setFormData({ ...formData, metric_type: val, unit: getDefaultUnit(val) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                        <SelectItem value="blood_sugar">Blood Sugar</SelectItem>
                        <SelectItem value="weight">Weight</SelectItem>
                        <SelectItem value="bmi">BMI</SelectItem>
                        <SelectItem value="heart_rate">Heart Rate</SelectItem>
                        <SelectItem value="temperature">Temperature</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Value *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label>Unit</Label>
                    <Input
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder={getDefaultUnit(formData.metric_type)}
                    />
                  </div>

                  <div>
                    <Label>Notes</Label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes"
                    />
                  </div>

                  <div>
                    <Label>Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={new Date(formData.recorded_at).toISOString().slice(0, 16)}
                      onChange={(e) => setFormData({ ...formData, recorded_at: new Date(e.target.value).toISOString() })}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setEditingMetric(null) }}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingMetric ? 'Update' : 'Add'}</Button>
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

