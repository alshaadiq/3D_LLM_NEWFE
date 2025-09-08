# 3D LLM Frontend (NEWFE) - Integrated with Backend

A modern Vue 3 + TypeScript frontend that integrates with the 3D_LLM_BE backend to provide a complete AI assistant experience with document processing, chat functionality, and AETOS platform function calling.

## 🚀 Quick Start

### Option 1: Use the Full-Stack Launcher
```bash
# Run both frontend and backend together
.\start-fullstack.bat
```

### Option 2: Manual Setup

#### Backend (Terminal 1)
```bash
cd C:\Repo\3D_LLM\3D_LLM_BE
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### Frontend (Terminal 2)
```bash
cd C:\Repo\3D_LLM\3D_LLM_NEWFE
npm install
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs

## 🔐 Demo Login

Use these credentials to test the application:
- **Username**: `demo`
- **Password**: `password`

## ✨ Features

### 🤖 Dual Chat Modes
- **Chat Mode**: Conversational AI responses
- **Agent Mode**: Function calling with AETOS platform integration

### 📄 Document Processing
- Upload PDF, DOCX, TXT files
- Automatic text extraction and chunking
- Vector embeddings for semantic search
- RAG (Retrieval-Augmented Generation) integration

### 🛰️ AETOS Platform Integration
- **AETOS Browser**: Satellite imagery functions
- **AETOS Cube**: Data processing capabilities  
- **AETOS Terra**: 3D visualization and analysis

### 🧠 Advanced AI Features
- **Triple RAG**: Documents + Internal Knowledge + Function Discovery
- **Context-Aware Responses**: Intelligent context from multiple sources
- **Function Discovery**: Automatic detection of relevant capabilities
- **Parameter Extraction**: Smart parameter inference from user queries

### 📊 Data Management
- Chat history with automatic summarization
- Document library with search capabilities
- Function execution history
- Real-time processing status

## 🎨 Design System

Built with the **Aetosky Design System**:
- **Dark Theme**: Modern dark interface optimized for professional use
- **Primary Color**: #BEF975 (signature green)
- **Typography**: Inter font family for optimal readability
- **Responsive**: Mobile-first design with Tailwind CSS
- **Consistent**: Unified component library throughout

## 🏗️ Architecture

```
Frontend (Vue 3 + TypeScript)
├── 🔐 Authentication System
├── 💬 Chat Management
├── 📄 Document Processing
├── � Function Calling
└── 🎨 Design System

Backend (FastAPI + Python)
├── 🔐 JWT Authentication
├── 💾 MongoDB Database
├── 🧮 FAISS Vector Store
├── 🤖 OpenAI Integration
└── 🛰️ AETOS Platform
```

## 📁 Project Structure

```
src/
├── components/           # Vue components
│   ├── ChatInterface.vue    # Main chat interface
│   ├── LoginForm.vue        # Authentication form
│   └── ui/                  # Reusable UI components
├── composables/          # API integration
│   └── useBackendApi.ts     # Complete backend API wrapper
├── stores/              # Pinia state management
│   ├── authStore.ts         # Authentication state
│   ├── chatStore.ts         # Chat management
│   ├── documentStore.ts     # Document handling
│   └── functionStore.ts     # Function calling
├── types/               # TypeScript definitions
└── assets/              # Styles and design system
```

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- Git

### Setup
```bash
# Clone and install
git clone <repository>
cd 3D_LLM_NEWFE
npm install

# Environment setup
cp .env.development .env
# Edit .env if needed

# Development server
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

### Code Quality
```bash
npm run type-check    # TypeScript validation
npm run lint         # ESLint checking
npm run format       # Prettier formatting
npm run test:unit    # Unit tests
```

## 🌐 Environment Configuration

### Development (.env.development)
```env
VITE_BACKEND_URL=http://127.0.0.1:8000
VITE_BACKEND_TOKEN=secret-token
VITE_APP_TITLE=3D LLM Frontend (Dev)
VITE_DEBUG=true
```

### Production (.env.production)
```env
VITE_BACKEND_URL=https://your-production-backend.com
VITE_BACKEND_TOKEN=your-production-token
VITE_APP_TITLE=3D LLM Frontend
VITE_DEBUG=false
```

## 📋 Usage Examples

### Chat Mode
```
User: "What is machine learning?"
Assistant: [Conversational response about ML concepts]
```

### Agent Mode with Function Calling
```
User: "Show me satellite images of New York"
Agent: 🤖 I'll help you find satellite images of New York.
       [Executes get_collections function]
       [Executes browse_imagery function]
       Here are the available satellite images for New York...
```

### Document Upload and Search
```
1. Upload PDF document via interface
2. Document is automatically processed and indexed
3. Ask questions about the content
4. Get context-aware responses with source citations
```

## 🔍 API Integration

The frontend integrates with all backend endpoints:

- **Authentication**: Login, logout, token validation
- **Chat Management**: Create, load, delete chats and messages
- **Document Processing**: Upload, search, manage documents
- **Function Calling**: Discover, execute AETOS platform functions
- **Knowledge Base**: Search internal knowledge and context

See `INTEGRATION_GUIDE.md` for detailed API documentation.

## 🚨 Troubleshooting

### Common Issues

1. **Backend Not Running**
   ```
   Error: Network Error
   Solution: Ensure backend is running on port 8000
   ```

2. **CORS Issues**
   ```
   Error: CORS policy blocked
   Solution: Check backend CORS configuration
   ```

3. **Authentication Failures**
   ```
   Error: 401 Unauthorized
   Solution: Verify demo credentials or check token validity
   ```

### Debug Mode
Enable debug mode in environment:
```env
VITE_DEBUG=true
```

This provides:
- Detailed console logging
- API request/response logging
- State change tracking
- Error stack traces

## 📚 Documentation

- `INTEGRATION_GUIDE.md` - Detailed backend integration guide
- `DESIGN_SYSTEM.md` - Complete design system documentation
- Backend API docs available at http://127.0.0.1:8000/docs

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Maintain design system consistency
4. Add proper error handling
5. Update documentation for new features

## 📄 License

This project is part of the 3D LLM ecosystem.

---

**Built with 💚 using the Aetosky Design System**

For questions or support, please refer to the integration guide or check the backend API documentation.
