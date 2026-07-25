import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Paperclip, 
  Sparkles, 
  BookOpen, 
  FileText, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { aiAssistantInitialMessages, retrievedManualExcerpts } from '../../data/mockData';

export default function AIAssistantPage({ setActiveTab }) {
  const [messages, setMessages] = useState([
    ...aiAssistantInitialMessages,
    {
      id: "msg-2",
      sender: "USER",
      timestamp: "14:16",
      text: "Analyze vibration frequency anomaly for Motor MTR-8842-X on Line 3. What is the root cause?",
    },
    {
      id: "msg-3",
      sender: "AI",
      timestamp: "14:16",
      text: "### Diagnostic Analysis for Siemens Motor MTR-8842-X\n\nBased on spectral FFT decomposition from accelerometer **ACC-DE-01**, we detected a peak harmonic at **345.2 Hz** (4.2 mm/s RMS).\n\n| Parameter | Observed Value | ISO 10816 Limit | Status |\n|---|---|---|---|\n| Peak Frequency | 345.2 Hz | - | BPFO Outer Race |\n| RMS Velocity | 4.2 mm/s | 4.5 mm/s | Elevated Warning |\n| Bearing Temp | 78.4 °C | 95.0 °C | +13.4°C above normal |\n\n**Root Cause Diagnosis:** Micro-spalling defect on the outer ring pathway of the Drive End bearing (SKF 6314-C3).\n\n**Confidence Score:** 96.4% (Matched against Siemens 1LE5 Service Manual Page 84).",
      insights: [
        "Remaining Useful Life before structural race collapse: **142 hours**.",
        "Grease contamination suspected due to seal thermal degradation.",
      ],
      suggestedFollowups: [
        "Show step-by-step LOTO & Bearing replacement SOP",
        "Generate SAP Work Order draft for SKF 6314-C3",
        "Compare with last quarter thermal imaging log",
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [activeReference, setActiveReference] = useState(retrievedManualExcerpts);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: "USER",
      timestamp: new Date().toISOString().substring(11, 16),
      text: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Simulate AI response after delay
    setTimeout(() => {
      const aiMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: "AI",
        timestamp: new Date().toISOString().substring(11, 16),
        text: `### Copilot Guidance for: "${text}"\n\nI have cross-referenced the Siemens 1LE5 Maintenance Manual & SOP-M-04.\n\n1. **Safety Protocol**: Ensure 400V breaker CB-3A is locked out and tagged.\n2. **Tooling**: Requires 300 Nm torque wrench and SKF bearing puller.\n3. **Part Required**: SKF 6314-C3 Deep Groove Ball Bearing (Qty 1).\n4. **Estimated Work Time**: 90 minutes.`,
        suggestedFollowups: [
          "Check spare parts inventory for SKF 6314-C3",
          "Notify Shift B Maintenance Lead",
        ],
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                INDUSTRIAL COPILOT
              </span>
              <span className="text-slate-400 text-xs">• Retrieval-Augmented Generation (RAG) Active</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">
              TwinMind AI Engineer Assistant
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('documents')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Manage Knowledge Base</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Chat Stream (7 Cols) | Right Retrieved Manual Viewer (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Chat Stream */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[620px]">
          
          {/* Chat Stream Messages */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'USER';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {isUser ? 'Dipl.-Ing. Marcus' : 'TwinMind Copilot'}
                    </span>
                    <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm space-y-3'
                    }`}
                  >
                    <div className="whitespace-pre-line font-normal">
                      {msg.text}
                    </div>

                    {/* AI Insights bullets */}
                    {msg.insights && (
                      <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 space-y-1 mt-2 text-slate-800">
                        {msg.insights.map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span>{insight}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested Followups */}
                    {msg.suggestedFollowups && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Suggested Actions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedFollowups.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(sug)}
                              className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-slate-200 transition-colors flex items-center gap-1"
                            >
                              <span>{sug}</span>
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Attach Log / File"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask TwinMind AI regarding asset diagnostics, bearing replacement SOP, or thermal logs..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition-all text-slate-800"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT PANEL: Retrieved Manual Excerpts & References (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Retrieved Manual Section
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                {activeReference.confidence}% MATCH
              </span>
            </div>

            {/* Document Info Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-900">
                {activeReference.docTitle}
              </div>
              <div className="text-[11px] text-blue-600 font-semibold">
                {activeReference.docSection}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Page: <strong>{activeReference.pageNumber}</strong></span>
                <span>Type: <strong>PDF Reference</strong></span>
              </div>
            </div>

            {/* Manual Excerpt Box */}
            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-3 text-xs font-mono border border-slate-800">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest pb-1 border-b border-slate-800">
                [EXCERPT FROM INDEXED MANUAL]
              </div>
              <p className="leading-relaxed whitespace-pre-line text-[11px]">
                {activeReference.excerpt}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('documents')}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full PDF Document</span>
              </button>
              <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600" title="Download Reference">
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Quick Prompts Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quick Engineering Prompts
            </h3>
            <div className="space-y-1.5">
              {[
                "Explain LOTO safety steps for 400V motor circuit",
                "What is the ISO 10816-3 Class II vibration limit?",
                "Calculate OEE loss for Line 3 bearing downtime",
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 text-xs font-medium transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
