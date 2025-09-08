#!/bin/bash
echo "Starting 3D LLM Backend (Development)..."
cd "C:/Repo/3D_LLM/3D_LLM_BE"

# Check if virtual environment exists
if [ -f "3d-llm-be/bin/activate" ]; then
    echo "Activating virtual environment..."
    source "3d-llm-be/bin/activate"
fi

# Start the backend with auto-reload
python main.py --reload
