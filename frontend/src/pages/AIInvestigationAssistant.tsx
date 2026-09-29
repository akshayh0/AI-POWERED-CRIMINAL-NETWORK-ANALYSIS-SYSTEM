import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  RotateCcw, 
  Database, 
  Shield, 
  Info, 
  Activity, 
  AlertCircle,
  TrendingUp,
  BarChart2,
  MapPin,
  FileText,
  PieChart,
  HelpCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  insights?: string[];
  limitations?: string[];
  recordsAnalyzed?: number;
  timestamp?: string;
  isError?: boolean;
}

const WELCOME_TEXT = "Hello. I am the KSP AI Intelligence Assistant.\nI can help analyze the crime data available in the portal.";

export const AIInvestigationAssistant: React.FC = () => {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: 'bot', 
      text: WELCOME_TEXT,
      recordsAnalyzed: 120,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [sending, setSending] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    online: boolean;
    ai_engine?: string;
    groq_connected?: boolean;
    model?: string;
    records_available?: number;
  } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Poll or check status once on mount
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await apiService.getAiStatus();
        if (isMounted) setAiStatus(res);
      } catch (err) {
        if (isMounted) {
          setAiStatus({
            online: false,
            ai_engine: 'Service Unavailable',
            groq_connected: false,
            model: 'Offline',
            records_available: 0
          });
        }
      }
    };
    checkStatus();
    return () => { isMounted = false; };
  }, []);

  const quickQuestions = [
    { 
      label: 'Crime Trends', 
      query: 'Analyze the major crime trends in the available database.',
      icon: TrendingUp
    },
    { 
      label: 'Most Common Crimes', 
      query: 'What are the most common crime categories in the available database?',
      icon: PieChart
    },
    { 
      label: 'Location Analysis', 
      query: 'Which locations have the highest reported crime counts in the available database?',
      icon: MapPin
    },
    { 
      label: 'Recent Crime Data', 
      query: 'Summarize recent crime records in the available database.',
      icon: FileText
    },
    { 
      label: 'Crime Statistics', 
      query: 'Give me a summary of the available crime statistics.',
      icon: BarChart2
    },
    { 
      label: 'Explain Dashboard', 
      query: 'Explain the current crime analytics dashboard based on the available data.',
      icon: Activity
    }
  ];

  const samplePrompts = [
    "What are the most common crime categories?",
    "Analyze the major crime trends.",
    "Which locations have the highest crime counts?",
    "Give me a summary of the available crime data.",
    "Explain the current crime analytics."
  ];

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || sending) return;

    const userMsg: Message = {
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputVal('');
    setSending(true);

    try {
      // Pass queryText and recent conversation history with officer security context
      const data = await apiService.postChatQuery(queryText, newHistory, {
        role: userProfile?.role || 'Officer',
        district: userProfile?.district || 'Karnataka State',
        name: userProfile?.name || 'Officer',
        clearance_level: userProfile?.role || 'Officer'
      });
      
      const botMsg: Message = {
        sender: 'bot',
        text: data.response || "No response received from intelligence node.",
        insights: data.insights || [],
        limitations: data.limitations || [],
        recordsAnalyzed: data.data_used?.records_analyzed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: !data.success
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "AI service is temporarily unavailable. Please try again.",
          limitations: ["Connection to backend analytics service could not be established."],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      { 
        sender: 'bot', 
        text: WELCOME_TEXT,
        recordsAnalyzed: aiStatus?.records_available || 120,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  return (
    <div className="space-y-6">
      {/* Header matching KSP Intelligence Center design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
                AI Intelligence Assistant
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Ask questions about crime intelligence and available analytical data.
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar: Status & Clear Chat */}
        <div className="flex items-center space-x-3">
          {/* Online / Offline status */}
          {aiStatus?.online !== false ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>● AI Online</span>
              {aiStatus?.groq_connected && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                  Groq
                </span>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>● AI Offline</span>
            </div>
          )}

          {/* Clear Chat Button */}
          <button
            onClick={handleClearChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            title="Reset conversation back to welcome state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Chat Console (3 Columns) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col h-[650px] justify-between">
          
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {/* Bot Avatar */}
                {m.sender === 'bot' && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    m.isError 
                      ? 'bg-rose-50 border border-rose-200 text-rose-600'
                      : 'bg-blue-50 border border-blue-200 text-blue-600'
                  }`}>
                    {m.isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4.5 h-4.5" />}
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed border shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white border-blue-600 rounded-br-2xs'
                    : m.isError
                    ? 'bg-rose-50/70 border-rose-200 text-slate-800 rounded-bl-2xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-800 rounded-bl-2xs'
                }`}>
                  
                  {/* Text Rendering with Safe Markdown formatting */}
                  <div className="space-y-2">
                    {m.text.split('\n').map((line, lIdx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={lIdx} className="h-1" />;

                      if (trimmed.startsWith('### ')) {
                        return (
                          <h3 key={lIdx} className={`font-bold text-sm mt-3 mb-1.5 first:mt-0 ${
                            m.sender === 'user' ? 'text-white' : 'text-slate-900'
                          }`}>
                            {trimmed.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (trimmed.startsWith('## ')) {
                        return (
                          <h2 key={lIdx} className={`font-bold text-base mt-4 mb-2 first:mt-0 ${
                            m.sender === 'user' ? 'text-white' : 'text-slate-900'
                          }`}>
                            {trimmed.replace('## ', '')}
                          </h2>
                        );
                      }
                      if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
                        const content = trimmed.slice(2);
                        const parts = content.split('**');
                        return (
                          <p key={lIdx} className={`pl-3 relative before:content-['•'] before:absolute before:left-0 mb-1 ${
                            m.sender === 'user' 
                              ? 'text-blue-50 before:text-blue-200' 
                              : 'text-slate-700 before:text-blue-500'
                          }`}>
                            {parts.map((p, pIdx) => pIdx % 2 === 1 
                              ? <strong key={pIdx} className={m.sender === 'user' ? 'text-white font-bold' : 'text-slate-900 font-bold'}>{p}</strong> 
                              : p
                            )}
                          </p>
                        );
                      }

                      // Ordered list 1. 2. 3.
                      const listMatch = trimmed.match(/^(\d+\.)\s+(.+)$/);
                      if (listMatch) {
                        const num = listMatch[1];
                        const content = listMatch[2];
                        const parts = content.split('**');
                        return (
                          <p key={lIdx} className={`pl-4 relative mb-1.5 ${
                            m.sender === 'user' ? 'text-blue-50' : 'text-slate-700'
                          }`}>
                            <span className="absolute left-0 font-semibold text-blue-600">{num}</span>
                            {parts.map((p, pIdx) => pIdx % 2 === 1 
                              ? <strong key={pIdx} className={m.sender === 'user' ? 'text-white font-bold' : 'text-slate-900 font-bold'}>{p}</strong> 
                              : p
                            )}
                          </p>
                        );
                      }

                      // Regular paragraph with inline bolding **
                      const parts = trimmed.split('**');
                      return (
                        <p key={lIdx} className={m.sender === 'user' ? 'text-white' : 'text-slate-700'}>
                          {parts.map((p, pIdx) => pIdx % 2 === 1 
                            ? <strong key={pIdx} className={m.sender === 'user' ? 'text-white font-bold' : 'text-slate-900 font-bold'}>{p}</strong> 
                            : p
                          )}
                        </p>
                      );
                    })}
                  </div>

                  {/* Render Key Insights if provided */}
                  {m.insights && m.insights.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200/80">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Key Insights</span>
                      </div>
                      <div className="space-y-1">
                        {m.insights.map((insight, iIdx) => (
                          <div key={iIdx} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-blue-500 font-bold mt-0.5">•</span>
                            <span>{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render Data Limitations if provided */}
                  {m.limitations && m.limitations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Info className="w-3 h-3 text-slate-400" />
                        <span>Data Limitations</span>
                      </div>
                      <div className="space-y-0.5">
                        {m.limitations.map((lim, lIdx) => (
                          <p key={lIdx} className="text-[11px] text-slate-500 italic">
                            • {lim}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer metadata (timestamp & records analyzed) */}
                  <div className={`mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t ${
                    m.sender === 'user' ? 'border-blue-500/40 text-blue-200' : 'border-slate-200/50 text-slate-400'
                  }`}>
                    {m.recordsAnalyzed !== undefined && m.recordsAnalyzed > 0 ? (
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <Database className="w-3 h-3 text-slate-400" />
                        {m.recordsAnalyzed} records verified
                      </span>
                    ) : <span />}
                    <span>{m.timestamp}</span>
                  </div>

                  {/* Show Quick-Questions buttons below welcome message (first message) */}
                  {idx === 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-600 mb-2 uppercase tracking-wider">
                        Quick Intelligence Inquiries:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {quickQuestions.map((q, qIdx) => {
                          const IconComp = q.icon;
                          return (
                            <button
                              key={qIdx}
                              onClick={() => handleSend(q.query)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-[11px] font-medium text-slate-700 hover:text-blue-700 transition-colors shadow-2xs"
                            >
                              <IconComp className="w-3 h-3 text-blue-600" />
                              <span>{q.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

                {/* User Avatar */}
                {m.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <User className="w-4.5 h-4.5" />
                  </div>
                )}

              </div>
            ))}

            {/* Loading Indicator */}
            {sending && (
              <div className="flex space-x-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4.5 h-4.5 animate-spin" />
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-700 text-xs flex items-center space-x-2.5 shadow-2xs">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                  <span className="font-medium text-slate-700">AI is analyzing the available intelligence data...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Form Input Area */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
            className="flex items-center space-x-2 bg-slate-50 border border-slate-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-2xs"
          >
            <input
              type="text"
              placeholder="Ask the AI about crime intelligence..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none px-3"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={sending}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              disabled={!inputVal.trim() || sending}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

        {/* Intelligence Sidebar Panel (Right Column) */}
        <div className="space-y-5">
          
          {/* Quick-Question Shortcuts Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Quick Questions</span>
            </h3>
            <div className="space-y-1.5">
              {quickQuestions.map((q, idx) => {
                const IconComp = q.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(q.query)}
                    disabled={sending}
                    className="w-full text-left text-xs p-2.5 bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-200 rounded-xl text-slate-700 hover:text-blue-900 transition-all flex items-center justify-between group disabled:opacity-50"
                  >
                    <span className="font-medium flex items-center gap-2">
                      <IconComp className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                      {q.label}
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-blue-500">Run →</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sample Questions Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Sample Questions</span>
            </h3>
            <div className="space-y-1.5">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={sending}
                  className="w-full text-left text-xs p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Platform Intelligence Status Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                Crime Database Scope
              </span>
              <span className="font-mono text-blue-600 font-bold">120 Records</span>
            </div>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Districts Covered:</span>
                <span className="font-medium text-slate-700">7 Jurisdictions</span>
              </div>
              <div className="flex justify-between">
                <span>Police Stations:</span>
                <span className="font-medium text-slate-700">36 Units</span>
              </div>
              <div className="flex justify-between">
                <span>Date Range:</span>
                <span className="font-medium text-slate-700">2023 - 2026</span>
              </div>
              <div className="flex justify-between">
                <span>AI Engine:</span>
                <span className="font-medium text-slate-700">
                  {aiStatus?.groq_connected ? `Groq (${aiStatus.model})` : 'Structured Intelligence'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
