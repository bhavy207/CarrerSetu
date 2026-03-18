import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi there! 👋 I'm your AI Career Advisor.\n\nAsk me anything about your professional path, new skills to learn, or career transitions. I'm here to help!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMessage } as Message];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/chat',
        {
          message: userMessage,
          history: messages.slice(1) // exclude the greeting
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );

      setMessages([...newMessages, { role: 'model', content: response.data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        { role: 'model', content: "Oops! I encountered an error connecting to my thought engine. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Premium Floating Toggle Button */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-400), var(--accent-violet))', filter: 'blur(12px)', opacity: 0.6, zIndex: -1 }}
            />
          )}
        </AnimatePresence>
        
        <motion.button
          onClick={toggleChat}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: isOpen ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--brand-600), var(--brand-400))',
            color: isOpen ? 'var(--text-secondary)' : 'white',
            border: isOpen ? '1px solid var(--glass-border)' : 'none',
            boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-lg), var(--shadow-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.3s ease, border 0.3s ease',
          }}
        >
          {isOpen ? (
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <line x1="18" y1="6" x2="6" y2="18"></line>
               <line x1="6" y1="6" x2="18" y2="18"></line>
             </svg>
          ) : (
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Premium Glass Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(5px)' }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
            style={{
              position: 'fixed',
              bottom: '7.5rem',
              right: '2rem',
              width: '380px',
              height: '600px',
              maxHeight: '80vh',
              background: theme === 'dark' ? 'rgba(13, 13, 43, 0.85)' : 'rgba(255, 255, 255, 0.90)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: '24px',
              boxShadow: 'var(--shadow-xl), 0 0 40px rgba(99, 102, 241, 0.15)',
              border: '1px solid var(--glass-border-hover)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 9998,
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem',
              background: theme === 'dark' ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(167, 139, 250, 0.1))' : 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(167, 139, 250, 0.05))',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              position: 'relative'
            }}>
               <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--brand-500), var(--accent-violet))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
               }}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8"></path>
                    <rect x="4" y="8" width="16" height="12" rx="2"></rect>
                    <path d="M2 14h2"></path>
                    <path d="M20 14h2"></path>
                    <path d="M15 13v2"></path>
                    <path d="M9 13v2"></path>
                 </svg>
               </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>AI Career Advisor</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
                  Online & Ready
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}>
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <div style={{
                       padding: '0.875rem 1.15rem',
                       borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                       background: msg.role === 'user' 
                          ? 'linear-gradient(135deg, var(--brand-600), var(--brand-500))'
                          : theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                       color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                       boxShadow: msg.role === 'user' ? '0 4px 15px rgba(99, 102, 241, 0.3)' : '0 2px 8px rgba(0,0,0,0.02)',
                       border: msg.role === 'user' ? 'none' : '1px solid var(--glass-border)',
                       fontSize: '0.95rem',
                       lineHeight: '1.5',
                       position: 'relative',
                       wordBreak: 'break-word',
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:700; color: ' + (msg.role === 'user' ? '#fff' : 'var(--brand-400)') + '">$1</strong>')
                        .replace(/\n/g, '<br/>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    style={{
                      alignSelf: 'flex-start',
                      padding: '1rem 1.25rem',
                      borderRadius: '20px 20px 20px 4px',
                      background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      border: '1px solid var(--glass-border)',
                      display: 'flex',
                      gap: '0.4rem',
                      alignItems: 'center'
                    }}
                  >
                     {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.div key={i} animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 0.8, delay, ease: 'easeInOut' }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-400)' }} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderTop: '1px solid var(--glass-border)' }}>
              <form onSubmit={sendMessage} style={{
                display: 'flex',
                gap: '0.75rem',
                position: 'relative'
              }}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for career advice..."
                  style={{
                    flex: 1,
                    padding: '0.875rem 1rem',
                    borderRadius: '14px',
                    border: '1px solid var(--glass-border)',
                    background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#fff',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--brand-500)'; e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15), inset 0 2px 4px rgba(0,0,0,0.05)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.05)'; }}
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  whileHover={{ scale: input.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: input.trim() ? 0.95 : 1 }}
                  style={{
                    padding: '0 1.2rem',
                    borderRadius: '14px',
                    border: 'none',
                    background: input.trim() ? 'linear-gradient(135deg, var(--brand-600), var(--brand-400))' : 'var(--glass-bg-strong)',
                    color: input.trim() ? '#fff' : 'var(--text-muted)',
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: input.trim() ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </motion.button>
              </form>
              <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI can make mistakes. Verify important info.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
