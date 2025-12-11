# Tech Stack
1. **Frontend**: React 19 (via Vite) + TypeScript
	- Core: React 19, TypeScript, Native CSS
	- Native Libraries: @apollo/client (for graphQL), react-pdf (for rendering documents).
	- **Why**: **Vite** was likely chosen for its near-instant server start time and hot module replacement, vastly superior to older tools like Create React App. **TypeScript** ensures type safety across the application, preventing runtime errors. **Native CSS** keeps specific styling lightweight and custom without the overhead or opinionated constraints of a framework like Tailwind (unless added later).
2. **Backend**: Python + Flask + LangChain
	- Core: Python, Flask
	- AI/ML: LangChain (orchestration), Google Gemini Pro (LLM & Embeddings), FAISS (Vector Store).
	- Utilities: pypdf (parsing), python-dotenv (Configuration)
	- - **Why**: **Flask** is extremely lightweight and unopinionated, making it perfect for spinning up a simple REST API (```/ask```,```/upload```) without the boilerplate of Django. **LangChain** is the industry standard for glueing together LLMs and data sources. **FAISS** allows for high-performance, local vector similarity search without needing a managed database like Pinecone.
3. **Gateway**: Node.js + Express + Apollo Server
	 - Core: Node.js, Express, Apollo Server
	 - Protocol: GraphQL
	 - **Why**: **GraphQL** allows the frontend to request _exactly_ the data it needs (e.g., just the answer text, or answer + source pages), preventing over-fetching. A **Node.js** gateway is ideal for handling concurrent I/O requests and unifying different backend services (even if currently some flows bypass it).
4. **AI Engine**: Google Gemini Pro
	- Models: gemini-pro (reasoning), embedding-001 (vectorization).
	- **Why**: Likely chosen for its strong reasoning capabilities comparable to GPT-4 but often with better availability, pricing, or integration within the Google Cloud ecosystem you might be using.
# Project Inventory

This document provides a cleaned-up, linted version of the project inventory you supplied. It organizes entry points, compute, storage, and external integrations with clear "Who uses this?" and context descriptions.

---

## 1. Entry Points (Frontend / Client)

### i) `frontend/src/main.tsx`
- **Who uses this?** Web browser
- **Context:** The absolute starting point of the React application. This script runs immediately when the page loads and mounts the React app into the DOM. It's the bridge between the browser's initial blank page and the application's UI.

### ii) `frontend/src/App.tsx`
- **Who uses this?** End users (laptop/mobile)
- **Context:** The main container for the UI (e.g., Landing Page, Chatbox). It renders visual elements the end user interacts with — buttons, file uploaders, text boxes, and navigation. User actions such as "Upload" or typing a message are handled by components mounted inside `App.tsx`.

### iii) `gateway/src/index.ts`
- **Who uses this?** Frontend (programmatic user)
- **Context:** The GraphQL API gateway that aggregates and routes requests. The frontend does not call backend services directly; it calls the gateway, which acts as the "receptionist" for the system. The gateway figures out which backend service should receive the request and forwards it.

---

## 2. Compute (Backend / Logic)

### i) `backend/app.py`
- **Where does the thinking happen?** Python Server (Flask)
- **Context:** This is a persistent Python process running in a docker container. It does the "administrative" thinking: receiving the raw HTTP request, checking if files are valid, and deciding which core logic function to call. It orchestrates the flow but delegates the heavy lifting. 

### ii) `backend/rag_core.py`
- **Where does the thinking happen?** Python Logic + AI Libraries
- **Context:** This is where the complex "cognitive" thinking happens.
	- **Retrieval Thinking**: FAISS (running in Python Memory) calculcates mathematical distances between the user's question and document chunks.
	- **Generative Thinking**: The Python script construct the prompt, but the actual generation is offloaded to Google's servers (via the API call).

### iii) `gateway/src/index.ts` 
- **Where does the thinking happen?** Node.js Server
- **Context:** This is a persistent Node.js process. Its thinking is lightweight and organizational. It parses the incoming GraphQL query and maps it to the correct backend REST endpoint. It doesn't "know" what the answer is; It just knows who to ask.

---

## 3. Storage (Databases / Files)

### i) `backend/uploaded_documents/`
- **Where does data live?** Local File System (or Docker Volumes)
- **Context:** The files live as standard binary files on the disk of container, waiting to be read.

### ii) FAISS index (in memory)
- **Where does data live?** Random Access Memory (RAM)
- **Context:** This data lives purely in the active memory of the running Python process. It is a highly optimized mathematical structure (a list of vectors).

---

## 4. External World (APIs / Integrations)

### i) Google Gemini API
- **Who are we calling?** Google Generative Language API
- **Context:** We make a network request over the internet to Google's data centers. We send them the user's prompt and our relevant document chunks, and they send back the generated text. 

### ii) Hugging Face (local model via `sentence-transformers`)
- **Who are we calling?** **Essentially verify "Self (Local)"**, but originally **HuggingFace Hub**.
- **Context:** 
	- **Initially**: We call **HuggingFace's File Servers** (cdn-lfs.huggingface.co) _once_ to download the model weights file (```all-MiniLM-L6-v2```).
	- **During Operation**: It runs **Locally**. Once downloaded, the "call" stays entirely inside your machine (CPU). We are _not_ sending your private document text to HuggingFace servers for embedding; your local Python process uses the downloaded weights to do the math itself.

