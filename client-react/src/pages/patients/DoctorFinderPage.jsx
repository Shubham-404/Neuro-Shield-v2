// client-react/src/pages/patients/DoctorFinderPage.jsx
import React, { useEffect, useState } from 'react'
import { Shell } from '../../components/layout/Shell'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input, Label } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { PatientFeatures } from '../../services/api'
import { PageLoader } from '../../components/ui/loader'
import { useAuth } from '../../contexts/AuthContext'
import { Search, MapPin, Phone, Mail, Stethoscope } from 'lucide-react'

export default function DoctorFinderPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({
    city: '',
    state: '',
    specialty: '',
    latitude: '',
    longitude: ''
  })

  const { isAuthenticated, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      console.log('[DoctorFinderPage] Waiting for auth');
      return;
    }

    console.log('[DoctorFinderPage] Starting doctor search');
    
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[DoctorFinderPage] Got user location:', position.coords.latitude, position.coords.longitude);
          setSearchParams(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }))
        },
        (err) => {
          console.log('[DoctorFinderPage] Location access denied or failed:', err);
        }
      )
    }

    fetchDoctors()
  }, [authLoading, isAuthenticated])

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      console.log('[DoctorFinderPage] Fetching doctors with params:', searchParams);
      const params = Object.fromEntries(
        Object.entries(searchParams).filter(([_, v]) => v !== '')
      )
      const response = await PatientFeatures.findDoctors(params)
      if (response.data.success) {
        const doctors = response.data.doctors || [];
        console.log('[DoctorFinderPage] Found', doctors.length, 'doctors');
        setDoctors(doctors)
      } else {
        console.warn('[DoctorFinderPage] Failed to load doctors:', response.data);
      }
    } catch (err) {
      console.error('[DoctorFinderPage] Error fetching doctors:', err);
      if (err.response?.status !== 401) {
        window.dispatchEvent(new CustomEvent('toast', {
          detail: { title: 'Error', description: err.response?.data?.message || 'Failed to load doctors', variant: 'destructive' }
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchDoctors()
  }

  if (authLoading || loading) return <Shell><PageLoader show={true} /></Shell>

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Find Doctors & Hospitals</h1>
          <p className="text-slate-600 dark:text-slate-400">Search for healthcare providers near you</p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  value={searchParams.city}
                  onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={searchParams.state}
                  onChange={(e) => setSearchParams({ ...searchParams, state: e.target.value })}
                  placeholder="Enter state"
                />
              </div>
              <div>
                <Label>Specialty</Label>
                <Input
                  value={searchParams.specialty}
                  onChange={(e) => setSearchParams({ ...searchParams, specialty: e.target.value })}
                  placeholder="e.g., Cardiology, Neurology"
                />
              </div>
              <div className="md:col-span-3">
                <Button type="submit" className="w-full">
                  <Search className="h-4 w-4 mr-2" />
                  Search Doctors
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.length === 0 ? (
            <Card className="md:col-span-3">
              <CardContent className="py-8 text-center">
                <Stethoscope className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-500">No doctors found. Try adjusting your search criteria.</p>
              </CardContent>
            </Card>
          ) : (
            doctors.map((location) => (
              <Card key={location.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{location.doctor?.full_name || 'Doctor'}</CardTitle>
                      <CardDescription className="mt-1">
                        {location.doctor?.specialization || 'General Practitioner'}
                      </CardDescription>
                    </div>
                    {location.distance && (
                      <Badge variant="outline">{location.distance.toFixed(1)} km</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {location.hospital_name && (
                      <p className="font-semibold text-sm">{location.hospital_name}</p>
                    )}
                    <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{location.address}</p>
                        <p>{location.city}, {location.state} {location.postal_code}</p>
                      </div>
                    </div>
                    {location.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${location.phone}`} className="text-blue-600 hover:underline">
                          {location.phone}
                        </a>
                      </div>
                    )}
                    {location.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${location.email}`} className="text-blue-600 hover:underline">
                          {location.email}
                        </a>
                      </div>
                    )}
                    {location.specialties && location.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {location.specialties.map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{spec}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Shell>
  )
}

