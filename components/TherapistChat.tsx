import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, DailyLog } from '../types';
import { Send, MessageSquare, Brain } from './Icons';
import { GenerateContentResponse } from '@google/genai';
import { getTherapistChat as initChat } from '../services/geminiService';

interface TherapistChatProps {
  logs: DailyLog[];
}

export const TherapistChat: React.FC<TherapistChatProps> = ({ logs }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    const savedChat = localStorage.getItem('jellyfish_chat_history');
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
      // Initial greeting
      const initialMsg: ChatMessage = {
        id: 'init',
        role: 'model',
        text: "Hello, I'm Dr. Jelly. I've taken a look at your recent wellness logs. How are you feeling today?",
        timestamp: new Date().toISOString()
      };
      setMessages([initialMsg]);
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('jellyfish_chat_history', JSON.stringify(messages));
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Initialize chat with current history (excluding the message we just added effectively, 
      // but the SDK handles history state if we use the same instance. 
      // However, for stateless functional components without a ref to the chat object, 
      // we re-init the chat with history up to the previous point).
      // Note: We pass `messages` (previous state) as history.
      const chatSession = initChat(messages, logs); 
      
      const result = await chatSession.sendMessage({ message: userMsg.text });
      
      const modelMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: result.text || "I'm listening...",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: "I'm having a little trouble connecting right now. Can we try again in a moment?",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl h-[600px] flex flex-col animate-fade-in relative overflow-hidden">
        {/* Background Ambient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 z-10 bg-white/5 backdrop-blur-md">
        <div className="p-2 bg-teal-500/20 rounded-full text-teal-300">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-white">Dr. Jelly</h2>
          <p className="text-xs text-blue-300">AI Wellness Companion</p>
        </div>
        <div className="ml-auto">
            <button 
                onClick={() => {
                    localStorage.removeItem('jellyfish_chat_history');
                    setMessages([]);
                    window.location.reload();
                }}
                className="text-xs text-white/40 hover:text-white hover:bg-white/10 px-3 py-1 rounded-full transition-colors"
            >
                Reset Chat
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white/10 text-blue-100 rounded-tl-none border border-white/5'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 flex gap-1">
              <div className="w-2 h-2 bg-teal-400/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-teal-400/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-teal-400/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/10">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what's on your mind..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-teal-900/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};