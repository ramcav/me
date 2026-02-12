import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChat } from '../../hooks/useChat';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, isTyping, error, sendMessage, clearChat } = useChat();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    setInput('');
    sendMessage(trimmed);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan text-bg shadow-lg transition-shadow hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] cursor-pointer"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open chat"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-4 bottom-4 z-50 flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            style={{ height: 520 }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan animate-pulse" />
                <span className="font-heading text-sm font-semibold text-text">
                  AI Assistant
                </span>
                <span className="font-mono text-[10px] text-text-dim">
                  ask about my work
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="rounded-lg p-1.5 text-text-dim transition-colors hover:bg-surface-light hover:text-text-secondary cursor-pointer"
                  aria-label="Clear chat"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-text-dim transition-colors hover:bg-surface-light hover:text-text-secondary cursor-pointer"
                  aria-label="Close chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <MessageSquare className="text-text-dim" size={32} />
                  <p className="text-sm text-text-secondary">
                    Ask me anything about my projects, experience, or tech stack.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      'What projects have you built?',
                      'What languages do you use?',
                      'Tell me about your experience',
                    ].map(q => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] text-text-secondary transition-all hover:border-cyan/40 hover:text-cyan cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan/15 text-cyan border border-cyan/20'
                        : 'bg-surface-light text-text-secondary border border-border'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                          code: ({ children }) => (
                            <code className="rounded bg-bg/50 px-1 py-0.5 font-mono text-xs text-orange">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="my-2 overflow-x-auto rounded-lg bg-bg/50 p-3 font-mono text-xs">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-xl border border-border bg-surface-light px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan/60 [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan/60 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan/60 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              {error && (
                <p className="text-center font-mono text-xs text-orange/70">{error}</p>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2 focus-within:border-cyan/40">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-dim"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="rounded-lg p-1.5 text-cyan transition-colors hover:bg-cyan/10 disabled:opacity-30 cursor-pointer"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
