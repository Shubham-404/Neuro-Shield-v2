// src/pages/StaffDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Doctor, Analytics } from '../services/api';
import { PageLoader } from '../components/ui/loader';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function StaffDashboardPage() {
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to be ready before making API calls
    if (authLoading || !isAuthenticated) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [docRes, statsRes] = await Promise.all([
          Doctor.getProfile(),
          Analytics.getDashboard()
        ]);
        if (docRes.data.success) {
          setDoctor(docRes.data.doctor);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.summary);
          setCharts(statsRes.data.charts);
        }
      } catch (err) {
        // Only show error if it's not a 401 (handled by interceptor)
        if (err.response?.status !== 401) {
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { title: 'Error', description: 'Failed to load dashboard', variant: 'destructive' }
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authLoading, isAuthenticated]);

  if (authLoading || loading) return <Shell><PageLoader show={true} /></Shell>;

  const COLORS = ['#22c55e', '#eab308', '#ef4444'];

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Welcome, {doctor ? `Dr. ${doctor.full_name || doctor.name || 'User'}` : 'User'}
          </h1>
          <Button onClick={() => navigate('/patients')}>Manage Patients</Button>
        </div>

        {/* Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader><CardTitle>Total Patients</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{stats.total_patients || 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>High Risk</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-red-600">{stats.high_risk || 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Moderate Risk</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-yellow-600">{stats.moderate_risk || 0}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Low Risk</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-green-600">{stats.low_risk || 0}</p></CardContent>
            </Card>
          </div>
        )}

        {/* Dashboard Summary and Risk Distribution */}
        {stats && charts && (
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Dashboard Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Summary</CardTitle>
                <CardDescription>Overview statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Patients</span>
                    <span className="font-semibold">{stats.total_patients || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">High Risk</span>
                    <span className="font-semibold text-red-600">{stats.high_risk || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Moderate Risk</span>
                    <span className="font-semibold text-amber-600">{stats.moderate_risk || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Low Risk</span>
                    <span className="font-semibold text-green-600">{stats.low_risk || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Distribution Card */}
            {charts.riskDistribution && charts.riskDistribution.length > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Risk Distribution</CardTitle>
                  <CardDescription>Current patient cohort</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={charts.riskDistribution}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={4}
                        >
                          {charts.riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        
      </div>
    </Shell>
  );
}