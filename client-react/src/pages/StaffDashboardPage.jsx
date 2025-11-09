// src/pages/StaffDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Shell } from '../components/layout/Shell';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Doctor, Analytics } from '../services/api';
import { PageLoader } from '../components/ui/loader';

export default function StaffDashboardPage() {
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
        }
      } catch (err) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: 'Failed to load dashboard', variant: 'destructive' }
        }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Shell><PageLoader show={true} /></Shell>;

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Welcome, {doctor ? `Dr. ${doctor.full_name || doctor.name || 'User'}` : 'User'}
          </h1>
          <Button onClick={() => navigate('/patients')}>Manage Patients</Button>
        </div>

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
      </div>
    </Shell>
  );
}