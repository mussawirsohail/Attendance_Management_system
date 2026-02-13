// src/components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background border-t py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-semibold">Attendance Management System</h2>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered attendance tracking system
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Navigation</h3>
              <ul className="space-y-1">
                <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link></li>
                <li><Link href="/students" className="text-sm text-muted-foreground hover:text-foreground">Students</Link></li>
                <li><Link href="/attendance" className="text-sm text-muted-foreground hover:text-foreground">Attendance</Link></li>
                <li><Link href="/reports" className="text-sm text-muted-foreground hover:text-foreground">Reports</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Account</h3>
              <ul className="space-y-1">
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Login</Link></li>
                <li><Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground">Sign Up</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t mt-6 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Attendance Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}