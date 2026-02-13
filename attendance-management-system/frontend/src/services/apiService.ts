// apiService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Define types for our data
export interface Student {
  id: number;
  name: string;
  created_at: string;
}

export interface Attendance {
  id: number;
  student_id: number;
  date: string;
  status: 'present' | 'absent' | 'late';
  created_at: string;
}

export interface AIParseRequest {
  command: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// User functions
export const registerUser = async (userData: UserRegistration): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Registration failed');
  }

  return response.json();
};

export const login = async (credentials: LoginCredentials): Promise<Token> => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.json();
};

// Student functions
export const getStudents = async (token: string): Promise<Student[]> => {
  const response = await fetch(`${API_BASE_URL}/students/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch students');
  }

  return response.json();
};

export const createStudent = async (token: string, studentData: { name: string }): Promise<Student> => {
  const response = await fetch(`${API_BASE_URL}/students/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(studentData),
  });

  if (!response.ok) {
    throw new Error('Failed to create student');
  }

  return response.json();
};

export const deleteStudent = async (token: string, studentId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete student');
  }
};

// Attendance functions
export const createManualAttendance = async (token: string, attendanceData: { 
  student_id: number; 
  status: 'present' | 'absent' | 'late'; 
  date?: string; 
}): Promise<Attendance> => {
  const response = await fetch(`${API_BASE_URL}/attendance/manual/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(attendanceData),
  });

  if (!response.ok) {
    throw new Error('Failed to create attendance');
  }

  return response.json();
};

export const createAIAttendance = async (token: string, aiRequest: AIParseRequest): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/ai/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(aiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Attendance API Error:', response.status, errorText);
      throw new Error(`Failed to process AI attendance: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Network or other error in createAIAttendance:', error);
    throw error;
  }
};

export const getAttendanceByDate = async (token: string, dateStr: string): Promise<Attendance[]> => {
  const response = await fetch(`${API_BASE_URL}/attendance/date/${dateStr}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch attendance');
  }

  return response.json();
};

export const getAttendanceByStudent = async (token: string, studentId: number): Promise<Attendance[]> => {
  const response = await fetch(`${API_BASE_URL}/attendance/student/${studentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch attendance');
  }

  return response.json();
};

// Reporting functions
export const getAttendanceSummary = async (token: string, dateStr: string): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/attendance/summary/${dateStr}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch attendance summary');
  }

  return response.json();
};