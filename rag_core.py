import os #interact with the operating system
import re  
from dotenv import load_dotenv #load environment variables from a .env file
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings #Google Generative AI
from langchain_community.vectorstores import FAISS #FAISS is a vector store for efficient similarity search
from langchain.text_splitter import RecursiveCharacterTextSplitter #split text into chunks
from langchain_community.document_loaders import TextLoader, PyPDFLoader #load text files
from langchain.chains import RetrievalQA #retrieval QA chain to use over your own data
from langchain.prompts import PromptTemplate #prompt template to use over your own datas

#Load environment variables
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

#Configure Gemini Model and Embeddings
llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=api_key, temperature=0.3) #temperature is the randomness of the model
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key) #embeddings are the vectors that represent the text

# Initialize RAG components as None. They will be created after a file is uploaded.
vector_store = None
qa_chain = None

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
        vector_store = FAISS.from_documents(texts, embeddings)
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








