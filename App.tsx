import React, { useState, useRef, useEffect } from 'react';
import { Send, Activity, ShieldCheck, Database, FileText } from 'lucide-react';
import { Message, AgentType } from './types';
import { sendMessageToCoordinator } from './services/geminiService';
import { executeSubAgent } from './services/mockSubAgents';
import ChatMessage from './components/ChatMessage';
import AgentAvatar from './components/AgentAvatar';

// Helper to define agent names map
const AGENT_NAMES: Record<AgentType, string> = {
  [AgentType.COORDINATOR]: "Koordinator Pusat",
  [AgentType.MEDICAL_RECORDS]: "Sub-agen Rekam Medis",
  [AgentType.APPOINTMENTS]: "Sub-agen Penjadwal",
  [AgentType.PATIENT_MANAGEMENT]: "Sub-agen Pasien",
  [AgentType.BILLING]: "Sub-agen Keuangan",
};

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      sender: AgentType.COORDINATOR,
      content: "Selamat datang di Pusat Komando Layanan Rumah Sakit. Saya adalah Koordinator Pusat. Silakan sampaikan kebutuhan Anda, dan saya akan mendelegasikan ke agen spesialis yang tepat.",
      timestamp: new Date(),
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.COORDINATOR);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);
    setActiveAgent(AgentType.COORDINATOR);

    try {
      // 1. Send to Coordinator (Gemini)
      // Format history for Gemini API
      const history = messages
        .filter(m => !m.isDelegationNotice) // Exclude system notices
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

      const { text, toolCalls } = await sendMessageToCoordinator(userMsg.content, history);

      // 2. Handle Coordinator's initial text response (if any - usually rare if forced to tool use)
      if (text) {
         // Usually Coordinator shouldn't speak much if strictly delegating, 
         // but if it rejects a query, it might speak.
         // However, in this design, we prioritize the tool call.
      }

      // 3. Process Tool Calls (Delegation)
      if (toolCalls && toolCalls.length > 0) {
        const tool = toolCalls[0]; // Take primary call
        
        // Determine target agent based on tool name
        let targetAgent = AgentType.COORDINATOR;
        let niceName = "Unknown Agent";

        if (tool.name.includes('rekam_medis')) { targetAgent = AgentType.MEDICAL_RECORDS; niceName = AGENT_NAMES[AgentType.MEDICAL_RECORDS]; }
        else if (tool.name.includes('penjadwal')) { targetAgent = AgentType.APPOINTMENTS; niceName = AGENT_NAMES[AgentType.APPOINTMENTS]; }
        else if (tool.name.includes('manajemen_pasien')) { targetAgent = AgentType.PATIENT_MANAGEMENT; niceName = AGENT_NAMES[AgentType.PATIENT_MANAGEMENT]; }
        else if (tool.name.includes('penagihan')) { targetAgent = AgentType.BILLING; niceName = AGENT_NAMES[AgentType.BILLING]; }

        // Add System Delegation Notice
        const delegationMsg: Message = {
          id: `del-${Date.now()}`,
          role: 'system',
          content: `Mendelegasikan tugas ke ${niceName}...`,
          isDelegationNotice: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, delegationMsg]);
        setActiveAgent(targetAgent);

        // Execute Sub-Agent Logic
        const result = await executeSubAgent(tool.name, tool.args);

        // Add Sub-Agent Response
        const responseMsg: Message = {
          id: `resp-${Date.now()}`,
          role: 'model',
          sender: result.agentType,
          content: result.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, responseMsg]);
        
      } else if (text) {
        // Fallback if no tool was called (Coordinator failed to delegate or handled simple greeting)
        setMessages(prev => [...prev, {
          id: `resp-${Date.now()}`,
          role: 'model',
          sender: AgentType.COORDINATOR,
          content: text,
          timestamp: new Date(),
        }]);
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'system',
        content: "Terjadi kesalahan sistem. Mohon periksa koneksi atau API Key Anda.",
        timestamp: new Date(),
        isDelegationNotice: true
      }]);
    } finally {
      setIsProcessing(false);
      // Reset back to coordinator visually after a delay, or keep active agent?
      // Keeping active agent shows who spoke last.
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans overflow-hidden">
      
      {/* Sidebar - Dashboard Aesthetic */}
      <div className="hidden md:flex flex-col w-80 bg-slate-900 border-r border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-hospital-500 rounded flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">MedCommand</h1>
        </div>

        <div className="space-y-6">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Status Agen</div>
          
          {(Object.values(AgentType) as AgentType[]).map((type) => (
             <div 
               key={type}
               className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                 activeAgent === type 
                   ? 'bg-slate-800 border-l-4 border-hospital-500 shadow-md' 
                   : 'opacity-50 grayscale hover:grayscale-0 hover:bg-slate-800/50'
               }`}
             >
               <AgentAvatar type={type} size="sm" />
               <div className="flex flex-col">
                 <span className={`text-sm font-medium ${activeAgent === type ? 'text-white' : 'text-slate-400'}`}>
                   {AGENT_NAMES[type]}
                 </span>
                 <span className="text-[10px] text-slate-500">
                   {activeAgent === type ? 'Online & Active' : 'Standby'}
                 </span>
               </div>
             </div>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
           <div className="flex items-center gap-2 text-xs text-slate-500">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             <span>Sistem Aman & Terenkripsi</span>
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        
        {/* Header (Mobile Only mostly) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur border-b border-slate-800 z-10 sticky top-0">
          <div className="flex items-center gap-2">
            <Activity className="text-hospital-500 w-5 h-5" />
            <span className="font-bold text-white">MedCommand</span>
          </div>
        </header>

        {/* Messages List */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isProcessing && (
              <div className="flex justify-start w-full mb-6 animate-pulse">
                <div className="flex gap-4 max-w-[75%]">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 font-mono uppercase tracking-widest">
                     Menganalisis Maksud...
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-slate-900/50 backdrop-blur-sm border-t border-slate-800">
          <div className="max-w-4xl mx-auto relative flex gap-4">
             <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Masukkan perintah untuk Koordinator... (Contoh: Cek hasil lab pasien Budi)"
                  className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 border border-slate-700 rounded-2xl pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-hospital-500/50 focus:border-hospital-500 transition-all resize-none h-[60px] custom-scrollbar"
                />
                <div className="absolute right-3 top-3">
                   <button 
                     onClick={handleSend}
                     disabled={!input.trim() || isProcessing}
                     className="p-2 bg-hospital-600 hover:bg-hospital-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Send className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
          <div className="max-w-4xl mx-auto mt-2 text-center">
            <p className="text-[10px] text-slate-600">
              Koordinator Pusat hanya mendelegasikan tugas. Data medis diproses oleh sub-agen khusus.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;