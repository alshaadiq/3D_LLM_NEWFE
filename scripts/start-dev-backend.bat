@echo off
echo Starting 3D LLM Backend (Development)...
cd /d "C:\Repo\3D_LLM\3D_LLM_BE"

REM Use the main virtual environment
echo Using main virtual environment Python...
"C:\Repo\3D_LLM\.venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload --reload-dir "C:\Repo\3D_LLM\3D_LLM_BE"
