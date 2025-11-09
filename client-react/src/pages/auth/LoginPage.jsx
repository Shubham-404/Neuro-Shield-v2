// src/pages/auth/LoginPage.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Input, Label } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useForm } from 'react-hook-form';
import { Loader } from '../../components/ui/loader';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const backendURL = import.meta.env.VITE_ENV === 'development' ? 'http://localhost:5000' : 'https://neuro-shield.vercel.app';
      const response = await axios.post(backendURL + '/api/login', data, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { user } = response.data;

      // Success Toast
      window.dispatchEvent(new CustomEvent('toast', {
        detail: {
          title: 'Welcome back!',
          description: `Signed in as ${user.name || user.email}`,
          variant: 'success'
        }
      }));

      // Role-based redirect
      const role = user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'doctor') navigate('/staff');
      else if (role === 'patient') navigate('/dashboard');
      else navigate('/dashboard');

    } catch (error) {
      const message = error.response?.data?.message || 'Invalid email or password';

      // Error Toast
      window.dispatchEvent(new CustomEvent('toast', {
        detail: {
          title: 'Login failed',
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
          <p className="opacity-90">Clinical-grade stroke severity prediction with explainability.</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <Link to="/" className='fixed top-10 left-10 text-lg'>&larr; Back</Link>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@hospital.org"
                  {...register('email', { required: 'Email is required' })}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' }
                  })}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader label="Signing in..." /> : 'Sign in'}
              </Button>
            </form>

            <div className="mt-4 text-sm text-center">
              <span className="text-slate-500">Don't have an account?</span>{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Create one
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}