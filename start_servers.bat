@echo off
echo Starting 3D LLM Backend and Frontend with Document Integration...
echo.

REM Change to backend directory and start backend
echo Starting Backend Server...
cd /d "C:\Repo\3D_LLM\3D_LLM_BE"
start cmd /k "python main.py"

REM Wait a moment for backend to start
timeout /t 3

REM Change to frontend directory and start frontend
echo Starting Frontend Development Server...
cd /d "C:\Repo\3D_LLM\3D_LLM_NEWFE"
start cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting...
echo 📱 Frontend will be available at: http://localhost:5173
echo 🔧 Backend API will be available at: http://127.0.0.1:8000
echo 📄 Backend API docs: http://127.0.0.1:8000/docs
echo.
echo 🚀 Document upload integration is now ready!
echo.
echo To test document upload:
echo 1. Navigate to the Document tab
echo 2. Click "Upload Document" or drag files to the upload area
echo 3. Select supported files (PDF, DOCX, TXT, MD - max 10MB)
echo 4. Watch the upload progress and view documents in the sidebar
echo.
pause
