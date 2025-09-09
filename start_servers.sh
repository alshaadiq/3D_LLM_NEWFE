#!/bin/bash

echo "Starting 3D LLM Backend and Frontend with Document Integration..."
echo

# Start backend server in background
echo "Starting Backend Server..."
cd ../3D_LLM_BE
python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend development server
echo "Starting Frontend Development Server..."
cd ../3D_LLM_NEWFE
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Both servers are starting..."
echo "📱 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend API will be available at: http://127.0.0.1:8000"
echo "📄 Backend API docs: http://127.0.0.1:8000/docs"
echo
echo "🚀 Document upload integration is now ready!"
echo
echo "To test document upload:"
echo "1. Navigate to the Document tab"
echo "2. Click 'Upload Document' or drag files to the upload area"
echo "3. Select supported files (PDF, DOCX, TXT, MD - max 10MB)"
echo "4. Watch the upload progress and view documents in the sidebar"
echo
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
