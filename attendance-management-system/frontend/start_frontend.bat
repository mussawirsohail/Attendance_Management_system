@echo off
REM Startup script for the Attendance Management System frontend

echo Starting the Attendance Management System frontend...

REM Change to the frontend directory
cd /d "%~dp0"

REM Install dependencies if not already installed
npm install

REM Start the Next.js development server
npm run dev

pause