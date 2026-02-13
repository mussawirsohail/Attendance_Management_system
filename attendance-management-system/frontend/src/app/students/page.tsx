"use client";

import { useState, useEffect } from 'react';
import { getStudents as getStudentsApi, createStudent as createStudentApi, deleteStudent as deleteStudentApi } from '@/services/apiService';
import ProtectedLayout from '../protected-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // In a real app, we would get the token from context or storage
      const token = localStorage.getItem('token') || '';

      const newStudent = await createStudentApi(token, { name: newStudentName });
      setStudents([...students, newStudent]);
      setNewStudentName("");
    } catch (err) {
      setError('Failed to add student');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setLoading(true);
      setError(null);

      try {
        // In a real app, we would get the token from context or storage
        const token = localStorage.getItem('token') || '';

        await deleteStudentApi(token, id);
        setStudents(students.filter(student => student.id !== id));
      } catch (err) {
        setError('Failed to delete student');
        console.error(err);
      } finally {
        setLoading(false);
      }
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
            <CardTitle>Manage Students</CardTitle>
            <CardDescription>Add, view, and manage student records</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStudent} className="mb-6 flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Enter student name"
                className="flex-grow"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading}
                className="whitespace-nowrap"
              >
                {loading ? 'Adding...' : 'Add Student'}
              </Button>
            </form>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.id}</TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{new Date(student.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                            disabled={loading}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No students found
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