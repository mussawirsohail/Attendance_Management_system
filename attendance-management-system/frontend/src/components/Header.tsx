// src/components/Header.tsx
'use client';

import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        <h1 className="text-xl font-bold">Attendance Management System</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          {isLoggedIn ? (
            <nav className="flex items-center space-x-4">
              <ul className="flex space-x-4">
                <li><Link href="/" className="text-sm font-medium hover:underline underline-offset-4">Dashboard</Link></li>
                <li><Link href="/students" className="text-sm font-medium hover:underline underline-offset-4">Students</Link></li>
                <li><Link href="/attendance" className="text-sm font-medium hover:underline underline-offset-4">Attendance</Link></li>
                <li><Link href="/reports" className="text-sm font-medium hover:underline underline-offset-4">Reports</Link></li>
              </ul>
              <Button
                onClick={handleLogout}
                variant="destructive"
              >
                Logout
              </Button>
            </nav>
          ) : (
            <nav>
              <ul className="flex space-x-4">
                <li><Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">Login</Link></li>
                <li><Link href="/signup" className="text-sm font-medium hover:underline underline-offset-4">Sign Up</Link></li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}