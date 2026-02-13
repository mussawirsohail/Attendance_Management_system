"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Log the API URL for debugging
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
      console.log('Signup endpoint:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/register`);

      // Call the signup API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text(); // Get raw text in case it's not JSON
        let errorMessage = 'Signup failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorText;
        } catch (e) {
          // If response is not JSON, use the raw text
          errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const userData = await response.json();
      console.log('User registered:', userData);

      // Now login the user after successful signup
      const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', loginResponse.status);
      console.log('Login response ok:', loginResponse.ok);

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        let errorMessage = 'Login after signup failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorData.message || errorText;
        } catch (e) {
          errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const tokenJson = await loginResponse.json();
      console.log('Login successful, token received');
      // Use the auth context to handle login
      login(tokenJson.access_token);
    } catch (err: any) {
      // Check if it's a network error
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to the server. Please make sure the backend server is running.');
      } else {
        setError(err.message || 'An error occurred during signup');
      }
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="w-full">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join our attendance management system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">Username</label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-primary hover:underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}