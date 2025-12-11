# Project Context: RAG Document Engine

## Overview
**RAG Document Engine** is an AI-powered application that allows users to upload documents (PDF, TXT) and ask questions about their content using a Retrieval-Augmented Generation (RAG) pipeline.

The system uses Google's Gemini Pro model for reasoning and embeddings, FAISS for vector storage, and a modern React frontend for interaction.

## Technology Stack

### Backend (Python)
- **Framework**: Flask (REST API)
- **AI/ML**: LangChain, Google Gemini Pro (`gemini-pro`, `embedding-001`)
- **Vector Store**: FAISS (Facebook AI Similarity Search)
- **Document Processing**: `pypdf`, `langchain-community`
- **Environment Management**: `python-dotenv`

### Frontend (TypeScript)
- **Framework**: React 19 (via Vite)
- **Language**: TypeScript
- **Styling**: Native CSS (Variables, Responsive Design), Animations
- **HTTP Client**: Native `fetch`

### Gateway (Node.js)
- **Framework**: Express, Apollo Server
- **Protocol**: GraphQL
- **Purpose**: Intended as an API Gateway to aggregate services (currently bypassed in some flows).

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Orchestration**: `docker-compose.yml` defines 3 services: `backend`, `gateway`, `frontend`.

## System Architecture

### Services
1.  **Backend (`/`)**:
    -   **Entry Point**: `app.py`
    -   **Core Logic**: `rag_core.py` (RAG pipeline initialization, retrieval, generation).
    -   **Port**: `5000` (mapped to host `5001`).
    -   **API Endpoints**:
        -   `POST /upload-document`: Handles file uploads and initializes the vector store.
        -   `POST /ask`: Answers questions based on uploaded documents.
        -   `GET /health`: Health check.

2.  **Frontend (`/rag-document-frontend`)**:
    -   **Entry Point**: `src/main.tsx`
    -   **Port**: `5173`.
    -   **Data Flow**: Currently makes direct REST calls to the Backend (`http://localhost:5001`), bypassing the Gateway for document operations.

3.  **Gateway (`/rag-document-gateway`)**:
    -   **Entry Point**: `src/index.ts`
    -   **Port**: `4000`.
    -   **Role**: Exposes a GraphQL API (`askCV` mutation) that proxies requests to the backend. *Note: Not currently used by the main frontend upload flow.*

## Project Structure

```
rag-document-engine/
├── backend/                # [Backend] All Python backend files
│   ├── app.py
│   ├── rag_core.py
│   ├── requirements.txt
│   ├── dockerfile
│   └── uploaded_documents/
├── frontend/               # [Frontend] React application
│   ├── src/
│   ├── package.json
│   └── dockerfile
├── gateway/                # [Gateway] Node.js GraphQL service
│   ├── src/
│   └── package.json
├── docker-compose.yml      # Orchestration for all services
└── PROJECT_CONTEXT.md      # Project Documentation
```

## Setup & Usage

### Prerequisites
- Docker & Docker Compose
- Google Cloud API Key (Gemini)

### Running the Application
1.  **Environment Setup**:
    Create a `.env` file in the root directory (or use CLI export):
    ```bash
    export GEMINI_API_KEY=your_api_key_here
    ```

2.  **Start Services**:
    ```bash
    docker-compose up --build
    ```

3.  **Access**:
    -   Frontend: `http://localhost:5173`
    -   Backend API: `http://localhost:5001`
    -   Gateway GraphQL: `http://localhost:4000/graphql`
