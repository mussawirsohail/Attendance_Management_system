"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAttendanceByDate as getAttendanceByDateApi, getAttendanceSummary as getAttendanceSummaryApi } from '@/services/apiService';
import ProtectedLayout from '../protected-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Download, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch report data based on selected date
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);

      try {
        // In a real app, we would get the token from context or storage
        const token = localStorage.getItem('token') || '';

        // Fetch summary
        const summary = await getAttendanceSummaryApi(token, selectedDate);

        // Fetch detailed attendance
        const attendance = await getAttendanceByDateApi(token, selectedDate);

        setReportData(summary);
        setAttendanceData(attendance);
      } catch (err) {
        setError('Failed to load report data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedDate]);

  const handleExportCSV = () => {
    // In a real app, this would make an API call to download the CSV
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/reports/export/csv/${selectedDate}`;
  };

  const handleExportExcel = () => {
    // In a real app, this would make an API call to download the Excel file
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/reports/export/excel/${selectedDate}`;
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-lg">Loading reports...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Attendance Reports</CardTitle>
              <CardDescription>View and export attendance reports for the selected date</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 max-w-xs">
                <label className="block text-sm font-medium mb-2">Select Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                <Button onClick={handleExportCSV} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button onClick={handleExportExcel} variant="secondary" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Excel
                </Button>
              </div>
            </div>

            {reportData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-2xl">{reportData.total}</CardTitle>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Present</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
                      {reportData.present} ({reportData.presentPercentage}%)
                    </CardTitle>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Absent</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                      {reportData.absent} ({reportData.absentPercentage}%)
                    </CardTitle>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Late</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-2xl text-amber-600 dark:text-amber-400">
                      {reportData.late} ({reportData.latePercentage}%)
                    </CardTitle>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.length > 0 ? (
                    attendanceData.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.student_name || 'Unknown'}</TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            record.status === 'present' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100' :
                            record.status === 'absent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                          }`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No attendance records found for the selected date
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Visual representation of attendance patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col items-center justify-center bg-muted rounded-xl">
              <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Attendance trend visualization would appear here<br />
                Connect to a charting library like Recharts or Chart.js for data visualization
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </ProtectedLayout>
  );
}