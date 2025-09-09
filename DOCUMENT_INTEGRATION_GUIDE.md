# Document Upload Integration Guide

## Overview
The document management system is now fully integrated with the backend API. Users can upload, view, and delete documents through a complete UI workflow.

## Features Implemented

### ✅ Document Upload
- **Drag & Drop Interface**: Users can drag files directly onto the upload area
- **File Browser**: Click to open file selection dialog
- **Multi-file Support**: Upload multiple documents at once
- **Progress Tracking**: Real-time upload progress with status indicators
- **Error Handling**: Failed uploads show error messages and retry options
- **File Validation**: Supports PDF, DOCX, DOC, TXT, MD files (max 10MB)

### ✅ Document Management
- **Document List**: View all uploaded documents in the sidebar
- **Document Details**: Shows filename, size, content type, and processing status
- **Delete Documents**: Remove documents with confirmation dialog
- **Real-time Status**: Shows processing status (pending/completed/failed)

### ✅ Backend Integration
- **API Endpoints**: Fully integrated with `/documents/upload`, `/documents`, `/documents/{id}` endpoints
- **Document Store**: Uses Pinia store for state management
- **Progress Callbacks**: Real-time upload progress using axios upload progress
- **Error Handling**: Proper error handling and user feedback

## How to Use

### For Users:
1. **Navigate to Document Tab**: Click on the "Document" tab in the main navigation
2. **Upload Documents**: 
   - Click the "Upload Document" button or the drag-and-drop area
   - Select files or drag them directly into the modal
   - Click "Upload" to start the process
3. **View Documents**: Uploaded documents appear in the left sidebar
4. **Delete Documents**: Click the trash icon next to any document to delete it

### For Developers:
1. **Backend Requirements**: Ensure the backend API is running on `http://127.0.0.1:8000`
2. **Environment Variables**: Check `.env` file for proper API URL configuration
3. **Document Store**: The document store automatically loads documents on app startup
4. **Custom Integration**: Use `documentStore.uploadDocument(file)` for programmatic uploads

## API Endpoints Used

- `POST /documents/upload` - Upload new documents
- `GET /documents` - List all documents
- `GET /documents/{id}` - Get specific document details
- `DELETE /documents/{id}` - Delete a document

## File Support

**Supported Formats:**
- PDF documents (`.pdf`)
- Microsoft Word (`.docx`, `.doc`)
- Plain text (`.txt`)
- Markdown (`.md`)

**File Size Limit:** 10MB per file

## Error Handling

- **Network Errors**: Shows user-friendly messages for connection issues
- **File Size Errors**: Warns about files exceeding size limits
- **Format Errors**: Filters unsupported file types automatically
- **Upload Failures**: Shows specific error messages and allows retry

## Next Steps

The document viewer is currently a placeholder. Future enhancements could include:
- PDF rendering and viewing
- Document search functionality
- Document chunking and RAG integration
- Document processing status updates
- Batch operations (delete multiple documents)

## Technical Details

**State Management:**
- Uses Pinia store (`documentStore`) for centralized state
- Reactive document list updates
- Upload progress tracking per file

**UI Components:**
- Modal-based upload interface
- Drag and drop with visual feedback
- Progress bars with status indicators
- Responsive design for different screen sizes

**Security:**
- Bearer token authentication
- File type validation
- Size limit enforcement
- CORS-enabled backend communication
