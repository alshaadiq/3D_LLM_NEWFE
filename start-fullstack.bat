@echo off
echo Starting 3D LLM Full Stack Application...
echo.

:: Check if we're in the right directory
if not exist "src" (
    echo Error: Please run this script from the 3D_LLM_NEWFE directory
    pause
    exit /b 1
)

:: Set window title
title 3D LLM Full Stack

:: Start backend in a new window
echo Starting Backend Server...
start "3D LLM Backend" cmd /k "cd /d C:\Repo\3D_LLM\3D_LLM_BE && python main.py"

:: Wait a moment for backend to start
timeout /t 3 /nobreak > nul

:: Start frontend
echo Starting Frontend Server...
echo Backend should be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the frontend server
echo To stop the backend, close the Backend window
echo.

npm run dev

echo.
echo Frontend server stopped.
echo Don't forget to close the Backend window if needed.
pause
