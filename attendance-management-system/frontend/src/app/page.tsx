"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStudents, getAttendanceByDate, createAIAttendance } from '@/services/apiService';
import VoiceInput from '@/components/VoiceInput';
import ProtectedLayout from './protected-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [aiInput, setAiInput] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map(result => result.transcript)
            .join('');
          setAiInput(transcript);
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          
          // Handle specific error types
          if (event.error === 'no-speech') {
            // No speech detected, just stop listening without alert
            console.log('No speech detected, stopping recognition');
          } else if (event.error === 'audio-capture') {
            alert('No microphone found. Please ensure a microphone is connected.');
          } else if (event.error === 'not-allowed') {
            alert('Microphone access was denied. Please allow microphone access to use voice input.');
          } else {
            console.warn('Speech recognition error:', event.error);
          }
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      } else {
        console.warn('Speech Recognition not supported in this browser');
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech Recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, we would get the token from context or storage
        const token = localStorage.getItem('token') || '';

        // Fetch students
        const studentsData = await getStudents(token);
        setStudents(studentsData);

        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0];
        const attendanceData = await getAttendanceByDate(token, today);
        setAttendanceRecords(attendanceData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleAIAttendanceSubmit = async () => {
    if (!aiInput.trim()) return;

    setAiProcessing(true);
    setError(null);

    try {
      // In a real app, we would get the token from context or storage
      const token = localStorage.getItem('token') || '';

      await createAIAttendance(token, { command: aiInput });
      setAiInput("");

      // Refresh the attendance data
      const today = new Date().toISOString().split('T')[0];
      const attendanceData = await getAttendanceByDate(token, today);
      setAttendanceRecords(attendanceData);
    } catch (err) {
      setError('Failed to process AI attendance');
      console.error(err);
    } finally {
      setAiProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'late': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Students</CardDescription>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl">{students.length}</CardTitle>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Present Today</CardDescription>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl text-emerald-600 dark:text-emerald-400">
                {attendanceRecords.filter(a => a.status === 'present').length}
              </CardTitle>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Absent Today</CardDescription>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-3xl text-red-600 dark:text-red-400">
                {attendanceRecords.filter(a => a.status === 'absent').length}
              </CardTitle>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Attendance Input</CardTitle>
            <CardDescription>Enter attendance command or use voice input</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Enter attendance command (e.g., 'Ali is present today') or click mic to speak"
                  className="flex-grow"
                />
                <VoiceInput
                  onResult={setAiInput}
                  isListening={isListening}
                  toggleListening={toggleListening}
                  className="shrink-0"
                />
                <Button
                  onClick={handleAIAttendanceSubmit}
                  disabled={aiProcessing}
                  className="whitespace-nowrap"
                >
                  {aiProcessing ? 'Processing...' : 'Process'}
                </Button>
              </div>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Examples: "Ali is present today", "Hamza and Ahmed are absent", "Mark Bilal late"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>View and manage today's attendance records</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/attendance">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
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
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record) => {
                      return (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.student_name || 'Unknown'}</TableCell>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No attendance records found for today
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </ProtectedLayout>
  );
}