import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Headphones, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SupportWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'agent',
      senderName: 'Tricelyn Support',
      text: 'Hello! Welcome to Tricelyn Indore Support. How can we help you with your groceries or order today?',
      time: 'Just now',
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Guest ID for unauthenticated visitors
  const [guestId] = useState(() => {
    let gid = localStorage.getItem('tricelyn_guest_id');
    if (!gid) {
      gid = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('tricelyn_guest_id', gid);
    }
    return gid;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      scrollToBottom();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/support/chat/messages', {
        params: { guestId, userName: user?.name || 'Customer' },
        headers: { 'x-guest-id': guestId },
      });
      if (res.data?.messages && res.data.messages.length > 0) {
        const formatted = res.data.messages.map((m, idx) => ({
          id: m._id || idx,
          sender: m.sender === 'admin' ? 'agent' : (m.sender === 'user' ? 'user' : 'system'),
          senderName: m.senderName || (m.sender === 'admin' ? 'Tricelyn Agent' : 'You'),
          text: m.message,
          time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(formatted);
      }
    } catch (err) {
      console.warn('Support messages fetch notice:', err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      sender: 'user',
      senderName: user?.name || 'You',
      text: userText,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      await api.post(
        '/support/chat/send',
        {
          message: userText,
          guestId,
          userName: user?.name || 'Customer',
          userPhone: user?.phone || 'Indore Customer',
        },
        { headers: { 'x-guest-id': guestId } }
      );

      // Automated helpful instant response simulation while agent connects
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'bot-' + Date.now(),
            sender: 'agent',
            senderName: 'Tricelyn Assistant',
            text: 'Thank you! Your query has been logged with our Indore Support Desk. An agent is reviewing your message.',
            time: 'Just now',
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setLoading(false);
      console.error('Support send error:', err);
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-full shadow-2xl transition-all duration-300 group"
          >
            <div className="relative">
              <Headphones className="w-5 h-5 text-white" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 absolute -top-0.5 -right-0.5 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 absolute -top-0.5 -right-0.5" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider leading-none">
                24/7 Support
              </p>
              <p className="text-xs font-black leading-none mt-1">
                Chat with Us
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[520px] animate-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-brand-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Tricelyn Support Desk</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-green-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span>Agents Online in Indore</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc] text-xs">
            <div className="text-center py-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2.5 py-0.5 rounded-full">
                Today
              </span>
            </div>

            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-bold text-gray-400 mb-1 px-1">
                    {m.senderName}
                  </span>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl shadow-xs leading-relaxed ${
                      isUser
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span
                      className={`text-[9px] mt-1 block text-right font-medium ${
                        isUser ? 'text-blue-200' : 'text-gray-400'
                      }`}
                    >
                      {m.time}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 italic py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce delay-200" />
                <span>Agent is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Issue Chips */}
          <div className="p-2 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              'Track my order',
              'Item missing / wrong item',
              'Delivery is late',
              'Refund status',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => setInputMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-gray-200 hover:border-brand-500 rounded-full text-[10px] font-semibold text-gray-700 transition flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white flex items-center justify-center transition shadow-xs flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default SupportWidget;
