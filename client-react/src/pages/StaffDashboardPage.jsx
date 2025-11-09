// src/pages/StaffDashboardPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboardPage() {
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, statsRes] = await Promise.all([
          axios.get('/api/doctor/profile', { withCredentials: true }),
          axios.get('/api/patient/analytics/dashboard', { withCredentials: true })
        ]);
        setDoctor(docRes.data.doctor);
        setStats(statsRes.data.summary);
      } catch (err) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: 'Failed to load dashboard', variant: 'destructive' }
        }));
      }
    };
    fetchData();
  }, []);

  if (!doctor || !stats) return <div className="p-6"><p>Loading...</p></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, Dr. {doctor.full_name}</h1>
        <Button onClick={() => navigate('/patients')}>Manage Patients</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Patients</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.total_patients}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>High Risk</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-600">{stats.high_risk}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Moderate Risk</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-yellow-600">{stats.moderate_risk}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Low Risk</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">{stats.low_risk}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}