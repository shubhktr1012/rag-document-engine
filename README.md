# CV AI Service

This project is a simple AI-powered service for answering questions about a CV. It uses a Retrieval-Augmented Generation (RAG) model to provide answers based on the content of a given CV.

## Architecture

The project consists of two main components:

1.  **Python Backend (`rag-document-engine`)**: A Flask application that exposes a RESTful API for the AI service. It uses LangChain and Google's Gemini Pro model to power the RAG functionality.
2.  **Node.js API Gateway (`rag-document-gateway`)**: A GraphQL API gateway built with Apollo Server and Express. It provides a clean, modern interface for interacting with the backend service.

Here is a high-level diagram of the architecture:
[Client] -> [GraphQL API Gateway (Node.js)] -> [RESTful API (Python)] -> [RAG Model]

## Getting Started

To get the project up and running, you will need to set up both the Python backend and the Node.js API gateway.

### Prerequisites

*   Python 3.8+
*   Node.js 14+
*   Docker (optional, for running the backend in a container)
*   A Google Gemini API key with the Gemini API enabled

### 1. Set Up the Python Backend

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd rag-document-engine
    ```

2.  **Create a virtual environment and install dependencies**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the root of the project and add your Google API key:
    ```
    GEMINI_API_KEY="your-gemini-api-key"
    ```

4.  **Add your CV**:
    Replace the content of `cv.txt` with your own CV.

5.  **Run the backend**:
    ```bash
    python app.py
    ```
    The backend will be running at `http://localhost:5000`.

### 2. Set Up the Node.js API Gateway

1.  **Navigate to the gateway directory**:
    ```bash
    cd rag-document-gateway
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the gateway**:
    ```bash
    npm start
    ```
    The API gateway will be running at `http://localhost:4000/graphql`.

## Usage

You can interact with the service by sending GraphQL mutations to the API gateway. Here is an example of how to ask a question using the `askCV` mutation:

```graphql
mutation {
  askCV(question: "What is the candidate's name?")
}
```

You can use a tool like Postman or the Apollo Studio Explorer (available at `http://localhost:4000/graphql`) to send this mutation.

## API Reference

### GraphQL API (Node.js)

*   **Endpoint**: `http://localhost:4000/graphql`
*   **Schema**:
    ```graphql
    type Mutation {
      askCV(question: String!): String
    }

    type Query {
      _empty: String
    }
    ```

### RESTful API (Python)

*   **Endpoint**: `/ask`
*   **Method**: `POST`
*   **Request Body**:
    ```json
    {
      "question": "Your question here"
    }
    ```
*   **Success Response**:
    ```json
    {
      "answer": "The answer to your question.",
      "sources": [
        {
          "source": "cv.txt",
          "content": "Relevant content from the CV..."
        }
      ]
    }
    ```
