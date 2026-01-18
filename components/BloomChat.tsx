import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, DailyLog } from '../types';
import { Send, ArrowLeft } from './Icons';
import { getBloomGuideChat as initChat } from '../services/geminiService';
import { BloomGuide } from './BloomConnections'; // Assuming BloomGuide interface is exported from BloomConnections

interface BloomChatProps {
  onBack: () => void;
  guide: BloomGuide;
  logs: DailyLog[];
  initialMessage?: string; // For the very first message sent from BloomConnections
}

export const BloomChat: React.FC<BloomChatProps> = ({ onBack, guide, logs, initialMessage }) => {
  const chatHistoryKey = `jellyfish_bloom_chat_history_${guide.id}`;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMessageSentRef = useRef(false);

  // Load chat history
  useEffect(() => {
    const savedChat = localStorage.getItem(chatHistoryKey);
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else if (initialMessage && !isInitialMessageSentRef.current) {
      // If no saved chat and an initial message is provided, add it as the first user message
      const firstUserMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        text: initialMessage,
        timestamp: new Date().toISOString()
      };
      setMessages([firstUserMsg]);
      isInitialMessageSentRef.current = true; // Mark as sent to prevent re-adding on re-renders
      
      // Immediately send this initial message to the AI for a response
      handleSendInitialMessage(firstUserMsg.text);
    } else {
        // If no saved chat and no initial message, greet the user from the guide
        const initialGuideMsg: ChatMessage = {
            id: 'guide-init',
            role: 'model',
            text: `Hi ${guide.name.split(' ')[0]} here. I'm glad you reached out! How can I support you today?`,
            timestamp: new Date().toISOString()
        };
        setMessages([initialGuideMsg]);
    }
  }, [guide.id, initialMessage]); // Only re-run when guide changes or initialMessage changes (careful with initialMessage ref)

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(chatHistoryKey, JSON.stringify(messages));
      scrollToBottom();
    }
  }, [messages, chatHistoryKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendInitialMessage = async (messageText: string) => {
    setIsLoading(true);
    try {
        const chatSession = initChat(guide, messages, logs); // Use messages array with initial user message
        const result = await chatSession.sendMessage({ message: messageText });
        const modelMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: result.text || "I'm here to listen.",
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
        console.error("Bloom Chat initial message error:", error);
        const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'model',
            text: `I'm having a little trouble connecting with ${guide.name.split(' ')[0]} right now. Please try again later.`,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
    }
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
      const chatSession = initChat(guide, messages, logs); 
      const result = await chatSession.sendMessage({ message: userMsg.text });
      
      const modelMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: result.text || "I'm listening and reflecting on what you've shared.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Bloom Chat error:", error);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: `I'm having a little trouble connecting with ${guide.name.split(' ')[0]} right now. Can you try again in a moment?`,
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
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3 z-10 bg-white/5 backdrop-blur-md">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-blue-200" />
        </button>
        <img src={guide.image} alt={guide.name} className="w-8 h-8 rounded-full object-cover border border-white/20" />
        <div>
          <h2 className="font-bold text-lg text-white">{guide.name}</h2>
          <p className="text-xs text-blue-300">Bloom Guide</p>
        </div>
        <div className="ml-auto">
            <button 
                onClick={() => {
                    localStorage.removeItem(chatHistoryKey);
                    setMessages([]);
                    // Optionally refresh the component to show initial greeting again
                    // window.location.reload(); 
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
                  ? 'bg-indigo-600 text-white rounded-tr-none'
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
              <div className="w-2 h-2 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-indigo-400/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
            placeholder={`Message ${guide.name.split(' ')[0]}...`}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-900/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};