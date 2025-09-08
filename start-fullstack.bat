@echo off
echo Starting 3D LLM Full Stack Application...
echo.

REM Start backend
echo [1/2] Starting Backend API...
cd /d "C:\Repo\3D_LLM\3D_LLM_BE"
start "3D LLM Backend" cmd /k "uvicorn main:app --reload --host 127.0.0.1 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
echo [2/2] Starting Frontend Development Server...
cd /d "C:\Repo\3D_LLM\3D_LLM_NEWFE"
start "3D LLM Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting...
echo 🔧 Backend API: http://127.0.0.1:8000
echo 🌐 Frontend App: http://localhost:5173
echo.
echo Press any key to exit this launcher...
pause > nul
