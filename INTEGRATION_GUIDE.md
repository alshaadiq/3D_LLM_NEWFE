# 3D LLM Backend Integration Guide

This document explains how the new 3D_LLM_NEWFE frontend integrates with the existing 3D_LLM_BE backend.

## Architecture Overview

```
┌─────────────────────┐    HTTP/REST API    ┌─────────────────────┐
│   3D_LLM_NEWFE     │ ←─────────────────→ │   3D_LLM_BE        │
│                     │                     │                     │
│ Vue 3 + TypeScript  │                     │ FastAPI + Python    │
│ Tailwind + Design   │                     │ MongoDB + FAISS     │
│ System              │                     │ RAG + Function      │
│                     │                     │ Calling             │
└─────────────────────┘                     └─────────────────────┘
```

## Frontend Components

### 1. API Integration Layer (`src/composables/useBackendApi.ts`)
- **Purpose**: Complete TypeScript wrapper for all backend endpoints
- **Features**:
  - Automatic authentication token management
  - Request/response interceptors
  - Error handling with automatic logout on 401
  - Full type safety with TypeScript interfaces

### 2. State Management (`src/stores/`)
- **Authentication Store** (`authStore.ts`): User authentication, token management
- **Chat Store** (`chatStore.ts`): Chat management, message handling, mode switching
- **Document Store** (`documentStore.ts`): Document upload, search, management
- **Function Store** (`functionStore.ts`): AETOS platform function calling

### 3. UI Components
- **LoginForm.vue**: Authentication interface with demo credentials
- **ChatInterface.vue**: Main chat interface with sidebar, message history, and mode switching

## Backend Integration Points

### 1. Authentication System
```typescript
// Login with credentials
const response = await api.login({
  username: 'demo',
  password: 'password',
  remember_me: true
})

// Automatic token storage and management
localStorage.setItem('auth_token', response.token)
```

### 2. Chat Management
```typescript
// Create new chat
const chat = await api.createChat()

// Send message with mode selection
const message = await api.sendUserMessage(chatId, 'Hello', 'agent')

// Get chat with full message history
const fullChat = await api.getChat(chatId)
```

### 3. Document Processing
```typescript
// Upload document for RAG
const result = await api.uploadDocument(file)

// Search documents using vector similarity
const searchResults = await api.searchDocuments({
  query: 'search term',
  limit: 5,
  score_threshold: 0.3
})
```

### 4. Function Calling (AETOS Platform)
```typescript
// Discover relevant functions
const functions = await api.discoverFunctions('satellite imagery')

// Execute specific function
const result = await api.executeAetosFunction('get_collections', {
  area_of_interest: 'New York'
})

// Full agent execution
const agentResult = await api.agentExecute(
  'Show me satellite images of New York',
  'auto',
  true
)
```

## Environment Configuration

### Development Setup
```env
# .env.development
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_BACKEND_TOKEN=secret-token
VITE_APP_TITLE=3D LLM Frontend (Dev)
VITE_DEBUG=true
```

### Production Setup
```env
# .env.production
VITE_BACKEND_URL=https://your-production-backend.com
VITE_BACKEND_TOKEN=your-production-token
VITE_APP_TITLE=3D LLM Frontend
VITE_DEBUG=false
```

## Features Integrated

### ✅ Authentication
- [x] User login/logout
- [x] Token-based authentication
- [x] Automatic session management
- [x] Demo credentials support

### ✅ Chat System
- [x] Create/delete chats
- [x] Send messages
- [x] Chat history sidebar
- [x] Mode switching (Chat vs Agent)
- [x] Real-time message updates

### ✅ Document Management
- [x] File upload (PDF, DOCX, TXT)
- [x] Document processing status
- [x] Document search with RAG
- [x] Document statistics
- [x] Chunk viewing

### ✅ Function Calling
- [x] AETOS platform integration
- [x] Function discovery
- [x] Function execution
- [x] Agent mode with auto-execution
- [x] Execution history

### ✅ Knowledge Base
- [x] Internal knowledge search
- [x] Context-aware responses
- [x] Triple RAG (Documents + Internal + Functions)

## Getting Started

### 1. Backend Setup
```bash
cd C:\Repo\3D_LLM\3D_LLM_BE
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup
```bash
cd C:\Repo\3D_LLM\3D_LLM_NEWFE
npm install
npm run dev
```

### 3. Quick Start (Both)
```bash
# Use the provided batch script
.\start-fullstack.bat
```

## API Endpoints Used

### Authentication
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `GET /auth/verify` - Token verification
- `GET /auth/me` - Get current user

### Chat Management
- `POST /chats` - Create new chat
- `GET /chats/{chat_id}` - Get chat with messages
- `DELETE /chats/{chat_id}` - Delete chat
- `POST /chats/{chat_id}/messages/user` - Send user message
- `POST /chats/{chat_id}/summarize` - Generate chat summary

### Document Processing
- `POST /documents/upload` - Upload document
- `GET /documents` - List all documents
- `GET /documents/{doc_id}` - Get document details
- `DELETE /documents/{doc_id}` - Delete document
- `POST /documents/search` - Search documents
- `GET /documents/stats` - Get document statistics

### Function Calling
- `GET /aetos/functions` - List available functions
- `POST /aetos/execute` - Execute specific function
- `GET /functions/discover` - Discover relevant functions
- `POST /agent/execute` - Full agent execution

### Knowledge Base
- `POST /internal-knowledge/search` - Search internal knowledge
- `GET /internal-knowledge/stats` - Get knowledge statistics
- `GET /context/search` - Multi-source context search

## Design System Integration

The frontend uses the Aetosky Design System with:
- **Colors**: Dark theme with #BEF975 primary green
- **Typography**: Inter font family with comprehensive scale
- **Components**: Consistent button, input, and card designs
- **Spacing**: 8px-based spacing system
- **Responsive**: Mobile-first responsive design

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS settings include frontend URL
   - Check that both servers are running on correct ports

2. **Authentication Failures**
   - Verify token format in requests
   - Check that backend authentication is properly configured

3. **File Upload Issues**
   - Ensure proper FormData handling
   - Check file size limits in backend configuration

4. **Function Calling Errors**
   - Verify AETOS platform integration
   - Check function parameter validation

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **Console Logging**: Extensive logging for debugging API calls and state changes
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Type Safety**: Full TypeScript integration for compile-time error checking

## Next Steps

1. **Production Deployment**: Configure production environment variables
2. **SSL/HTTPS**: Set up HTTPS for production
3. **Database**: Configure production MongoDB instance
4. **Monitoring**: Add application monitoring and logging
5. **Testing**: Implement unit and integration tests
6. **Performance**: Optimize bundle size and API performance
