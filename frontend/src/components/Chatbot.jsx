import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Stethoscope, AlertCircle, Sparkles } from 'lucide-react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Hello! I am your VidCare Clinical Health Assistant. I can help answer questions regarding medical conditions, symptoms, and certified health guidelines. How can I assist you today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', { message: userMsg });
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, I am having trouble connecting to the server. Please ensure the backend is running.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '880px', height: '85vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
          <Sparkles size={22} color="var(--accent-blue)" />
          <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-primary)' }}>
            Clinical Medical <span className="text-gradient-blue">Assistant</span>
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          A specialized clinical knowledge assistant referencing verified medical guidelines and protocols.
        </p>
      </header>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #EDEDED' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#FAFAFA' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '12px',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              maxWidth: '85%'
            }}>
              {/* Avatar */}
              <div style={{
                width: '38px', 
                height: '38px', 
                borderRadius: '50%',
                background: msg.sender === 'user' 
                  ? 'linear-gradient(135deg, #FA520F, #FFA110)' 
                  : 'linear-gradient(135deg, #1C1C1E, #3D3D3D)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#FFFFFF',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                {msg.sender === 'user' ? <User size={18} /> : <Stethoscope size={18} />}
              </div>

              {/* Message Bubble */}
              <div style={{
                background: msg.sender === 'user' ? '#FA520F' : '#FFFFFF',
                color: msg.sender === 'user' ? '#FFFFFF' : '#1F1F1F',
                padding: '14px 18px',
                borderRadius: '16px',
                border: msg.sender === 'bot' ? '1px solid #EDEDED' : 'none',
                boxShadow: msg.sender === 'bot' ? '0 2px 8px rgba(32, 31, 32, 0.04)' : '0 2px 8px rgba(46, 91, 255, 0.25)',
                whiteSpace: 'pre-line',
                lineHeight: '1.65',
                fontSize: '0.95rem'
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #FA520F, #FFA110)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#FFFFFF' 
              }}>
                <Stethoscope size={18} />
              </div>
              <div style={{ 
                background: '#FFFFFF', 
                padding: '12px 18px', 
                borderRadius: '16px', 
                color: '#3D3D3D', 
                border: '1px solid #EDEDED',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FA520F', display: 'inline-block' }}></span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFA110', display: 'inline-block' }}></span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FA520F', display: 'inline-block' }}></span>
                </div>
                <span>Clinical Assistant is analyzing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1.2rem 1.5rem', borderTop: '1px solid #EDEDED', background: '#FFFFFF' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ask any medical, symptom, or health question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ 
                flex: 1, 
                color: '#1F1F1F',
                background: '#FAFAFA',
                border: '1px solid #EDEDED'
              }}
            />
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px' }}
            >
              <Send size={18} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
