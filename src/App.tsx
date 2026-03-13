import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Info, Plus, Send, MessageSquare, ClipboardList, Users, Settings, Bot } from 'lucide-react';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm ready to assist with the physical evaluation. Please provide the patient's basic measurements to begin the assessment.",
    },
    {
      id: '2',
      sender: 'user',
      text: "Weight: 80kg, Height: 1.80m",
    },
    {
      id: '3',
      sender: 'ai',
      text: "Calculated BMI: 24.69 (Normal). Data recorded.\n\nLet's proceed with the anamnesis. Does the patient report any history of cardiovascular conditions or persistent joint pain during exercise?",
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), sender: 'user', text: inputValue }]);
    setInputValue('');
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: "Noted. Please continue with the assessment."
      }]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#101922] text-slate-100 font-sans flex justify-center">
      <div className="w-full max-w-md flex flex-col h-screen border-x border-slate-800 relative bg-[#101922]">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#101922] shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-100" />
            </button>
            <div>
              <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-100">FitAI Assessment</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-slate-400 font-medium">AI Assistant Active</span>
              </div>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors">
            <Info className="w-6 h-6 text-slate-100" />
          </button>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="flex flex-col items-center">
            <span className="bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              Today, Oct 24
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto justify-end' : ''}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-[#137fec] flex items-center justify-center shrink-0 shadow-lg shadow-[#137fec]/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`flex flex-col gap-1.5 ${msg.sender === 'user' ? 'items-end' : ''}`}>
                <p className={`text-slate-400 text-xs font-semibold ${msg.sender === 'user' ? 'mr-1' : 'ml-1'}`}>
                  {msg.sender === 'ai' ? 'FitAI' : 'Professional'}
                </p>
                <div className={`px-4 py-3 shadow-sm ${
                  msg.sender === 'ai' 
                    ? 'bg-[#1e293b] rounded-2xl rounded-bl-none border border-slate-700/50' 
                    : 'bg-[#137fec] rounded-2xl rounded-br-none shadow-lg shadow-[#137fec]/10'
                }`}>
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === 'user' ? 'text-white font-medium' : 'text-slate-100'}`}>
                    {msg.text}
                  </p>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0 overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0XjVmgTjVRxJfcRzWcaJ64wktVYBaM_uRvl3rpQjC9_kGzSudEhAQalvaqP3UyWY3rHAGkexsWzApSd6vNxfH4E4X5sdSjOe_RfnYafbeiw1H0_OJY9Lr0PUEc2lu8zEEFFoPKgSYrKZWWjCHFJjwVWzWgmZcd5__bHJfX5KcC0riVOgRFzFpYwumUlCG0ZOOUlQHZb7sHQ9ajVxsX8BT9o_qDkrUDOXrfei0_xPFFoLgz6h3bGudq-Zb3aaNYE0hkpUUmClIl2w" 
                    alt="Professional" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 px-11">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <div className="p-4 bg-[#101922] border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-2xl px-3 py-2 border border-slate-700/50">
            <button className="text-slate-500 hover:text-[#137fec] transition-colors p-1">
              <Plus className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a response..." 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 placeholder:text-slate-500 text-slate-100 outline-none"
            />
            <button 
              onClick={handleSend}
              className="bg-[#137fec] text-white w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#137fec]/90 transition-colors shadow-sm shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="flex gap-2 border-t border-slate-800 bg-[#0f172a] px-4 pb-6 pt-2 shrink-0">
          <button className="flex flex-1 flex-col items-center justify-end gap-1 text-[#137fec]">
            <div className="flex h-8 items-center justify-center">
              <MessageSquare className="w-6 h-6 fill-current" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider">Chat</p>
          </button>
          <button className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-500 hover:text-slate-300 transition-colors">
            <div className="flex h-8 items-center justify-center">
              <ClipboardList className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider">Reports</p>
          </button>
          <button className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-500 hover:text-slate-300 transition-colors">
            <div className="flex h-8 items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider">Patients</p>
          </button>
          <button className="flex flex-1 flex-col items-center justify-end gap-1 text-slate-500 hover:text-slate-300 transition-colors">
            <div className="flex h-8 items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider">Settings</p>
          </button>
        </nav>

      </div>
    </div>
  );
}
