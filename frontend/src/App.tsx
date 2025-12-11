// cv-ai-frontend/src/App.tsx
import React from 'react';
import './App.css';
import Chatbox from './Chatbox';
import FileUpload from './FileUpload';

function App() {
  const [chatSessionId, setChatSessionId] = React.useState(0);

  const handleReset = async () => {
    try {
      await fetch('http://localhost:5001/reset', { method: 'POST' });
      setChatSessionId(prev => prev + 1);
    } catch (error) {
      console.error("Failed to reset session:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="badge">AI-Powered Analysis</div>
          <h1>Unlock Insights from Your Documents</h1>
          <p>Upload any document—CVs, research papers, legal contracts—and get instant, accurate answers powered by advanced AI.</p>
          <button onClick={handleReset} className="reset-button">Reset Session</button>
        </div>
      </header>

      <main className="App-main">
        <div className="app-container">
          <FileUpload onUploadSuccess={() => setChatSessionId(prev => prev + 1)} />
          <Chatbox key={chatSessionId} />
        </div>
      </main>

      <section className="how-it-works">
        <div className="section-container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Upload Document</h3>
              <p>Drag and drop your PDF, DOCX, or TXT file. We securely process it in seconds.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3>AI Analysis</h3>
              <p>Our engine reads and understands the context, structure, and details of your file.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Ask Anything</h3>
              <p>Chat naturally with your document. Get summaries, specific details, or comparisons.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-container">
          <h2>Why Use Document Engine?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">⚡️</span>
              <h3>Instant Answers</h3>
              <p>Stop scrolling through pages. Get the exact information you need immediately.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <h3>Secure & Private</h3>
              <p>Your documents are processed securely and are never shared with third parties.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🧠</span>
              <h3>Smart Context</h3>
              <p>The AI understands nuances, technical terms, and complex sentence structures.</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📂</span>
              <h3>Multi-Format</h3>
              <p>Support for PDFs, Word documents, and plain text files for versatility.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="App-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Document Engine</h3>
            <p>Empowering your workflow with intelligent document analysis.</p>
          </div>
          <div className="footer-links">
            <p>
              Developed by <span className="font-bold">Shubh Khatri</span>
            </p>
            <div className="social-links">
              <a href="https://github.com/shubhktr1012" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://linkedin.com/in/shubh-khatri" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;