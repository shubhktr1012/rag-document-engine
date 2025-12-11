import os #interact with the operating system
import re  
from dotenv import load_dotenv #load environment variables from a .env file
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings #Google Generative AI
from langchain_community.vectorstores import FAISS #FAISS is a vector store for efficient similarity search
from langchain_text_splitters import RecursiveCharacterTextSplitter #split text into chunks
from langchain_community.document_loaders import TextLoader, PyPDFLoader #load text files
from langchain_classic.chains import RetrievalQA #retrieval QA chain to use over your own data
from langchain_core.prompts import PromptTemplate #prompt template to use over your own datas
from langchain_huggingface.embeddings import HuggingFaceEmbeddings

#Load environment variables
load_dotenv()

import shutil # file operations

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

#Configure Gemini Model and Embeddings
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key, temperature=0.3) #temperature is the randomness of the model
embeddings = HuggingFaceEmbeddings(model="all-MiniLM-L6-v2") #embeddings are the vectors that represent the text

# Initialize RAG components as None. They will be created after a file is uploaded.
vector_store = None
qa_chain = None

def reset_rag_model():
    """Resets the RAG model and deletes uploaded files."""
    global vector_store, qa_chain
    vector_store = None
    qa_chain = None
    
    upload_dir = 'uploaded_documents'
    if os.path.exists(upload_dir):
        try:
            shutil.rmtree(upload_dir)
            os.makedirs(upload_dir) # Recreate empty directory
            print("Reset RAG model and cleared uploaded documents.")
        except Exception as e:
            print(f"Error clearing uploaded documents: {e}")

qa_prompt = PromptTemplate.from_template(
    "You are answering strictly from the document provided to you. The user owns the document and consents to extracting details.\n"
    "Question: {question}\n\n"
    "Use the context to answer concisely. If not present, reply exactly this: 'Answer not found in the document.'\n\n"
    "Context:\n{context}"
)

def initialize_rag_model(document_path: str):
    """Initializes or updates the RAG model with a new document."""
    global vector_store, qa_chain

    try:
        file_extension = os.path.splitext(document_path)[1].lower()

        if file_extension == '.pdf':
            loader = PyPDFLoader(document_path)
        elif file_extension == '.txt':
            loader = TextLoader(document_path, encoding="utf-8")
        else:
            error_message = f"Unsupported file type: '{file_extension}'. Please upload a .pdf or .txt file."
            print(error_message)
            return False, error_message

        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        texts = text_splitter.split_documents(documents)
        
        # Initialize vector store with first batch to avoid empty index issues
        # Batch size of 10 with 2s sleep to respect free tier limits
        import time
        batch_size = 10
        vector_store = None
        
        print(f"Processing {len(texts)} text chunks...")
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            if vector_store is None:
                vector_store = FAISS.from_documents(batch, embeddings)
            else:
                vector_store.add_documents(batch)
            print(f"Processed batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}")
            time.sleep(2) # Sleep to prevent 429 Resource Exhausted

        retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 8, "fetch_k": 40})

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": qa_prompt}
        )
        print(f"RAG model initialized with document: {document_path}")
        return True, None
    except Exception as e:
        print(f"Error initializing RAG model: {e}")
        return False, str(e)

def get_answer_with_sources(query):
    """Gets an answer from the RAG chain"""
    if qa_chain is None:
        return {"answer": "Please upload a document first to begin the chat.", "sources": []}
    
    try:
        result = qa_chain.invoke(query)
        answer = result['result']
        sources = [
            {'source': d.metadata.get('source', 'unknown'), 'content': d.page_content[:300] + '...' if len(d.page_content) > 300 else d.page_content}
            for d in result.get('source_documents', [])
        ]
        if not answer or "not found" in answer.lower():
            answer = "Answer not found in the document."
        return {"answer": answer, "sources": sources}
    except Exception as e:
        return {"answer": f"An error occurred: {e}", "sources": []}
    
#Test the RAG chain
if __name__ == "__main__":
    question = "What is the person's phone number in the CV?"
    result = get_answer_with_sources(question)
    print(f"Question: {question}")
    print(f"Answer: {result}")
    print(f"\nRetrieved chunks Preview:")
    for i, d in enumerate(result['source_documents'], 1):
        print(f"\n[{i}] {d.metadata.get('source', 'unknown source')}")
        print(d.page_content[:300])
        print("...")








