// src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Input, Label } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { useForm } from 'react-hook-form';
import { Loader } from '../../components/ui/loader';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');

  const onSubmit = async (data) => {
    try {
      const formData = new URLSearchParams();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      const backendURL = import.meta.env.VITE_ENV === 'development' ? 'http://localhost:5000' : import.meta.env.VITE_BACKEND_URL;
      await axios.post(backendURL + '/api/signup', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      // Success Toast
      window.dispatchEvent(new CustomEvent('toast', {
        detail: {
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
          variant: 'success'
        }
      }));

      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Try again.';

      // Error Toast
      window.dispatchEvent(new CustomEvent('toast', {
        detail: {
          title: 'Registration failed',
          description: message,
          variant: 'destructive'
        }
      }));
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative gradient-bg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="absolute inset-0 p-10 text-white flex flex-col justify-end">
          <h2 className="text-3xl font-bold">NeuroShield</h2>
          <p className="opacity-90">Join us in revolutionizing stroke care.</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 overflow-y-auto">
        <Link to="/" className='fixed top-10 left-10 text-lg'>&larr; Back</Link>
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Fill in the details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Role */}
              <div>
                <Label>I am a</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="admin">Admin (Invite only)</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('role')} value={role} />
              </div>

              {/* Name */}
              <div>
                <Label>Full Name</Label>
                <Input
                  placeholder="Dr. John Smith"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="john@hospital.org"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Min 8 characters' }
                  })}
                />
                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
              </div>

              {/* Doctor Fields */}
              {role === 'doctor' && (
                <>
                  <div>
                    <Label>License Number</Label>
                    <Input placeholder="MD123456" {...register('license_number')} />
                  </div>
                  <div>
                    <Label>Specialization</Label>
                    <Input placeholder="Neurology" {...register('specialization')} />
                  </div>
                  <div>
                    <Label>Hospital</Label>
                    <Input placeholder="City General" {...register('hospital')} />
                  </div>
                </>
              )}

              {/* Patient Fields */}
              {role === 'patient' && (
                <>
                  <div>
                    <Label>Medical History (optional)</Label>
                    <Input placeholder="Hypertension, Diabetes" {...register('medical_history')} />
                  </div>
                  <div>
                    <Label>Blood Group</Label>
                    <Input placeholder="O+" {...register('blood_group')} />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader label="Creating account..." /> : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-sm text-center">
              <span className="text-slate-500">Already have an account?</span>{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}