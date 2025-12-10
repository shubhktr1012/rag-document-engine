// cv-ai-frontend/src/Chatbox.tsx
import React, { useState, useRef, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client';

const SEND_MESSAGE_MUTATION = gql`
    mutation AskCV($question: String!) {
        askCV(question: $question)
    }
`;

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

const Chatbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now(),
      text: "Hello! Please upload a document to get started. Once it's processed, you can ask me anything about it.",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const [askCV, { loading, error }] = useMutation(SEND_MESSAGE_MUTATION);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessageText = input;
      const newUserMessage: Message = {
        id: Date.now(),
        text: userMessageText,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInput('');

      try {
        const { data } = await askCV({ variables: { question: userMessageText } });

        if (data && data.askCV) {
          const aiMessage: Message = {
            id: Date.now() + 1,
            text: data.askCV,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prevMessages) => [...prevMessages, aiMessage]);
        } else {
          const aiErrorMessage: Message = {
            id: Date.now() + 1,
            text: 'Error - No valid response received.',
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prevMessages) => [...prevMessages, aiErrorMessage]);
        }
      } catch (e) {
        console.error("Error sending message:", e);
        const aiConnectionError: Message = {
          id: Date.now() + 1,
          text: 'Error - Could not send message.',
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prevMessages) => [...prevMessages, aiConnectionError]);
      }
    }
  };

  return (
    <div className="chatbox-container">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-content">{msg.text}</div>
            <span className="message-timestamp">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="loading-indicator">
            <span className="loading-label">AI</span>
            <div className="dot-flashing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="message error">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          placeholder="Type your message..."
          disabled={loading}
          autoFocus
        />
        <button
          className="send-button"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbox;