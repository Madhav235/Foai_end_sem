import { AnimatePresence, motion } from 'framer-motion';
import { Bot, MessageCircle, Send, Trash2, X } from 'lucide-react';
import { FormEvent, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { askAssistant } from '../../services/chatService';
import { useDashboardStore } from '../../store/dashboardStore';
import type { ChatMessage } from '../../types/dashboard';

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const { chatMessages, addChatMessage, clearChat, iss, news } = useDashboardStore();

  const canAnswer = useMemo(() => Boolean(iss.current || news.articles.length), [iss, news.articles.length]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || typing) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      createdAt: Date.now(),
    };
    addChatMessage(userMessage);
    setInput('');

    if (!canAnswer) {
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I only know the dashboard data, and it has not loaded enough ISS or news information yet.',
        createdAt: Date.now(),
      });
      return;
    }

    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setTyping(true);

    try {
      const answer = await askAssistant({
        message: trimmed,
        messages: [...chatMessages, userMessage],
        context: { iss, news: news.articles },
        signal: controllerRef.current.signal,
      });
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: answer,
        createdAt: Date.now(),
      });
    } catch {
      toast.error('Assistant unavailable');
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I could not reach the assistant service. I can only answer from the loaded dashboard data.',
        createdAt: Date.now(),
      });
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen((value) => !value)} aria-label="Open AI chatbot">
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.aside
            className="chat-window"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
          >
            <header className="flex items-center justify-between border-b border-soft p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-white">
                  <Bot size={20} />
                </span>
                <div>
                  <h2 className="font-semibold">Dashboard AI</h2>
                  <p className="text-xs text-muted">Bound to ISS and news data only</p>
                </div>
              </div>
              <button className="icon-button small" onClick={clearChat} title="Clear chat" aria-label="Clear chat">
                <Trash2 size={16} />
              </button>
            </header>
            <div className="chat-messages">
              {chatMessages.length ? (
                chatMessages.map((message) => (
                  <div key={message.id} className={`chat-bubble ${message.role}`}>
                    {message.content}
                  </div>
                ))
              ) : (
                <div className="empty-state compact">
                  Ask about the ISS position, crew, speed, article counts, or news summaries.
                </div>
              )}
              {typing ? <div className="chat-bubble assistant typing">Thinking...</div> : null}
            </div>
            <form className="chat-input" onSubmit={handleSubmit}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about dashboard data"
              />
              <button aria-label="Send message" disabled={typing || !input.trim()}>
                <Send size={17} />
              </button>
            </form>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
