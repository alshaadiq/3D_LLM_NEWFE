@echo off
echo Starting 3D LLM Backend...
cd /d "C:\Repo\3D_LLM\3D_LLM_BE"

REM Use the main virtual environment
echo Using main virtual environment Python...
"C:\Repo\3D_LLM\.venv\Scripts\python.exe" main.py
