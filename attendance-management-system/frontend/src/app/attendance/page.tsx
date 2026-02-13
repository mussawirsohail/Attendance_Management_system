"use client";

import { useState, useEffect } from 'react';
import { getStudents as getStudentsApi, getAttendanceByDate as getAttendanceByDateApi, createManualAttendance as createManualAttendanceApi, createAIAttendance as createAIAttendanceApi } from '@/services/apiService';
import VoiceInput from '@/components/VoiceInput';
import ProtectedLayout from '../protected-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualAttendance, setManualAttendance] = useState<{[key: number]: string}>({});
  const [aiInput, setAiInput] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // In a real app, we would get the token from context or storage
        const token = localStorage.getItem('token') || '';
        const studentsData = await getStudentsApi(token);
        setStudents(studentsData);
      } catch (err) {
        setError('Failed to load students');
        console.error(err);
      }
    };

    fetchStudents();
  }, []);

  // Fetch attendance for selected date
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // In a real app, we would get the token from context or storage
        const token = localStorage.getItem('token') || '';
        const attendanceData = await getAttendanceByDateApi(token, selectedDate);

        // Initialize manual attendance state
        const initialAttendance: {[key: number]: string} = {};
        students.forEach(student => {
          const existingRecord = attendanceData.find((a: any) => a.student_id === student.id);
          initialAttendance[student.id] = existingRecord?.status || "present";
        });
        setManualAttendance(initialAttendance);
      } catch (err) {
        setError('Failed to load attendance');
        console.error(err);
      }
    };

    if (students.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, students]);

  const handleStatusChange = (studentId: number, status: string) => {
    setManualAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveManualAttendance = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, we would get the token from context or storage
      const token = localStorage.getItem('token') || '';

      // Save each attendance record
      for (const [studentId, status] of Object.entries(manualAttendance)) {
        await createManualAttendanceApi(token, {
          student_id: parseInt(studentId),
          status: status as 'present' | 'absent' | 'late',
          date: selectedDate
        });
      }

      alert("Manual attendance saved successfully!");
    } catch (err) {
      setError('Failed to save attendance');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAttendanceSubmit = async () => {
    if (!aiInput.trim()) return;

    setAiProcessing(true);
    setError(null);

    try {
      // In a real app, we would get the token from context or storage
      const token = localStorage.getItem('token') || '';

      await createAIAttendanceApi(token, { command: aiInput });
      setAiInput("");

      // Refresh the attendance data
      const attendanceData = await getAttendanceByDateApi(token, selectedDate);

      // Update manual attendance state
      const updatedAttendance: {[key: number]: string} = {};
      students.forEach(student => {
        const existingRecord = attendanceData.find((a: any) => a.student_id === student.id);
        updatedAttendance[student.id] = existingRecord?.status || "present";
      });
      setManualAttendance(updatedAttendance);
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

        <Card>
          <CardHeader>
            <CardTitle>Manual Attendance Marking</CardTitle>
            <CardDescription>Mark attendance for students on the selected date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div className="rounded-md border mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <Select
                            value={manualAttendance[student.id] || "present"}
                            onValueChange={(value) => handleStatusChange(student.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Button
              onClick={handleSaveManualAttendance}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Saving...' : 'Save Attendance'}
            </Button>
          </CardContent>
        </Card>

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
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>Overview of attendance for the selected date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-emerald-800 dark:text-emerald-200">Present</h3>
                <p className="text-2xl font-bold">
                  {Object.values(manualAttendance).filter(status => status === 'present').length}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Absent</h3>
                <p className="text-2xl font-bold">
                  {Object.values(manualAttendance).filter(status => status === 'absent').length}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-amber-800 dark:text-amber-200">Late</h3>
                <p className="text-2xl font-bold">
                  {Object.values(manualAttendance).filter(status => status === 'late').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </ProtectedLayout>
  );
}