/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Scale,
  Send,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
  Search,
  BookOpen,
  Sparkles,
  RefreshCw,
  FolderOpen,
  User,
  ShieldAlert,
  Loader2,
  Volume2,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";

// Types matching server interface
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

interface LBHContact {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  description: string;
}

interface OCRResult {
  success: boolean;
  documentType: string;
  parties: string[];
  keyDates: { label: string; date: string }[];
  keyArticles: { num: string; summary: string }[];
  risksDetected: string[];
  recommendations: string[];
}

export default function App() {
  // Conversational states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<string>("");

  // AI & Mode Configuration
  const [tone, setTone] = useState<"formal" | "ramah" | "sangat sederhana">("ramah");
  const [lengthMode, setLengthMode] = useState<"ringkas" | "standar" | "detail">("standar");
  const [temperature, setTemperature] = useState(0.4);
  const [rememberEnabled, setRememberEnabled] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Helper parser for markdown-style bold tokens (**bold text**) inside lines
  const formatInlineBold = (content: string) => {
    if (!content) return "";
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const cleanText = part.slice(2, -2);
        return (
          <strong key={index} className="font-bold text-slate-950 font-sans">
            {cleanText}
          </strong>
        );
      }
      return part;
    });
  };

  // Structured rendering with block level rules + inline bold formatting
  const renderFormattedLine = (line: string, lIdx: number) => {
    // Calculate indentation level from original line to maintain sub-lists
    const leadingSpaces = line.length - line.trimStart().length;
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={lIdx} className="h-2" />;
    }

    // Dynamic padding style to indent nested lists inside the UI
    const indentStyle = leadingSpaces > 0 ? { paddingLeft: `${Math.min(leadingSpaces * 4, 48)}px` } : undefined;

    if (trimmed.startsWith("### ")) {
      const text = trimmed.substring(4);
      return (
        <h3 key={lIdx} className="text-base font-bold text-slate-900 mt-4 mb-2" style={indentStyle}>
          {formatInlineBold(text)}
        </h3>
      );
    }
    if (trimmed.startsWith("## ")) {
      const text = trimmed.substring(3);
      return (
        <h2 key={lIdx} className="text-lg font-bold text-blue-900 mt-5 mb-2.5" style={indentStyle}>
          {formatInlineBold(text)}
        </h2>
      );
    }
    if (trimmed.startsWith("# ")) {
      const text = trimmed.substring(2);
      return (
        <h1 key={lIdx} className="text-xl font-extrabold text-blue-950 mt-6 mb-3" style={indentStyle}>
          {formatInlineBold(text)}
        </h1>
      );
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.substring(2);
      return (
        <div key={lIdx} className="flex items-start gap-2 my-1 leading-relaxed text-slate-700" style={indentStyle}>
          <span className="text-blue-500 font-bold select-none mt-1 flex-shrink-0">•</span>
          <span className="flex-1">{formatInlineBold(text)}</span>
        </div>
      );
    }
    
    // Check if line matches a numbered list e.g. "1. "
    const numberMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numberMatch) {
      const numLabel = numberMatch[1];
      const text = numberMatch[2];
      return (
        <div key={lIdx} className="flex items-start gap-2 my-1 leading-relaxed text-slate-700" style={indentStyle}>
          <span className="text-blue-600 font-bold select-none mt-0.5 flex-shrink-0">{numLabel}.</span>
          <span className="flex-1">{formatInlineBold(text)}</span>
        </div>
      );
    }

    return (
      <p key={lIdx} className="text-slate-700 my-1.5 leading-relaxed" style={indentStyle}>
        {formatInlineBold(trimmed)}
      </p>
    );
  };

  // External API Placeholder / Curated directories
  const [lbhSearch, setLbhSearch] = useState("");
  const [lbhList, setLbhList] = useState<LBHContact[]>([]);
  const [loadingLBH, setLoadingLBH] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Semua");

  // OCR Document Review states
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [scannedFilename, setScannedFilename] = useState("");

  // Chat suggestion pills
  const sampleSuggestions = [
    { text: "Langkah PHK tiba-tiba", icon: "Sengketa kerja" },
    { text: "Batas denda pinjol", icon: "Utang piutang" },
    { text: "Aturan deposit kontrak sewa", icon: "Masalah kontrak" },
    { text: "Cara lapor arisan bodong", icon: "Penipuan online" }
  ];

  const viewPortEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Session ID on mount
  useEffect(() => {
    let storedSessionId = localStorage.getItem("hak_ku_session_id");
    if (!storedSessionId) {
      storedSessionId = "session_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("hak_ku_session_id", storedSessionId);
    }
    setSessionId(storedSessionId);
    fetchSessionData(storedSessionId);
    fetchLBH("");
  }, []);

  // Sync scroll to bottom on message update
  useEffect(() => {
    viewPortEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Fetch Session data from Node Backend
  const fetchSessionData = async (activeSessionId: string) => {
    try {
      const res = await fetch("/api/session/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setRememberEnabled(data.rememberEnabled);
        if (data.userPreferences) {
          setTone(data.userPreferences.tone);
          setLengthMode(data.userPreferences.lengthMode);
        }
        if (data.summary) {
          setSessionSummary(data.summary);
        }
      }
    } catch (error) {
      console.error("Gagal memuat sesi percakapan:", error);
    }
  };

  // Fetch LBH directory info
  const fetchLBH = async (cityQuery: string) => {
    setLoadingLBH(true);
    try {
      const url = cityQuery ? `/api/lbh?city=${encodeURIComponent(cityQuery)}` : "/api/lbh";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLbhList(data.list);
        }
      }
    } catch (e) {
      console.error("Gagal memuat data LBH:", e);
    } finally {
      setLoadingLBH(false);
    }
  };

  useEffect(() => {
    if (selectedCity === "Semua") {
      fetchLBH("");
    } else {
      fetchLBH(selectedCity);
    }
  }, [selectedCity]);

  // Handlers for AI parameter adjustments
  const handlePreferenceChange = async (newTone: typeof tone, newLength: typeof lengthMode) => {
    setTone(newTone);
    setLengthMode(newLength);
    try {
      await fetch("/api/session/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, tone: newTone, lengthMode: newLength })
      });
    } catch (err) {
      console.warn("Gagal memperbarui preferensi AI:", err);
    }
  };

  const handleToggleRemember = async (checked: boolean) => {
    setRememberEnabled(checked);
    try {
      const res = await fetch("/api/session/remember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, enabled: checked })
      });
      if (res.ok) {
        // Reload session state
        fetchSessionData(sessionId);
      }
    } catch (err) {
      console.warn("Gagal mengubah pengaturan penyimpanan logs:", err);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/session/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        setMessages([]);
        setSessionSummary("");
        setOcrResult(null);
        setScannedFilename("");
      }
    } catch (err) {
      console.error("Gagal menghapus riwayat:", err);
    } finally {
      setShowClearConfirm(false);
    }
  };

  // Chat message submission
  const triggerChatMessage = async (presetText?: string) => {
    const textToSend = presetText || inputMessage;
    if (!textToSend.trim() || loading) return;

    // Optimistically push user message to UI
    const newUserMessage: ChatMessage = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: textToSend,
          tone,
          lengthMode,
          temperature
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessages(data.session.messages || []);
          if (data.session.summary) {
            setSessionSummary(data.session.summary);
          }
        } else {
          throw new Error(data.error || "Gagal memperoleh respon model.");
        }
      } else {
        throw new Error("Koneksi server terganggu.");
      }
    } catch (err: any) {
      // Append warning message
      const errorResponse: ChatMessage = {
        role: "assistant",
        content: `⚠️ **Maaf, Hak.Ku terkendala jaringan:** ${err.message || "Gagal menghubungi modul hukum AI."} Silakan periksa kembali sambungan internet Anda atau coba sesaat lagi.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  // Simulated Document Reader (OCR File Upload)
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setScannedFilename(file.name);
    setOcrLoading(true);
    
    try {
      // Simulation of uploading file and scanning content
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          content: "Simulated binary string analysis..."
        })
      });
      
      if (response.ok) {
        const resultData = await response.json();
        setOcrResult(resultData);
        
        // Auto trigger assistant greeting regarding the scanned document
        const introPrompt = `Saya baru saja mengupload dokumen kontrak hukum bernama "${file.name}" berjenis ${resultData.documentType}. Berikan saya ringkasan komprehensif, rincian denda, risiko terdeteksi, serta langkah aman untuk saya.`;
        triggerChatMessage(introPrompt);
      }
    } catch (err) {
      console.error("Gagal melakukan penelaahan dokumen:", err);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(true);
  };

  const handleDragLeave = () => {
    setIsDraggingDoc(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDoc(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div id="hak-ku-app" className="flex h-screen w-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside id="sidebar-panel" className="w-[300px] bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-25 overflow-y-auto">
        
        {/* Branding */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-blue-50/10 to-teal-50/20">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-800">Hak.Ku</span>
              <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded-full uppercase">Edukasi</span>
            </div>
            <p className="text-[10px] tracking-wide text-slate-400 font-semibold">TANYA. PAHAMI. BERTINDAK</p>
          </div>
        </div>

        {/* Content & Options */}
        <div className="flex-1 p-5 space-y-6">
          
          {/* AI Settings Section */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3.5 block flex items-center justify-between">
              <span>Konfigurasi AI Hak.Ku</span>
              <span className="text-[9px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">v3.5 Fast</span>
            </label>
            
            <div className="space-y-4">
              {/* Temperature Selector */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Suhu Kreativitas / Akurasi</span>
                  <span className="text-blue-600 font-bold">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.7"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>Sangat Stabil (0.2)</span>
                  <span>Lebih Luas (0.7)</span>
                </div>
              </div>

              {/* Tone style Selector */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Gaya Penyajian Bahasa
                </p>
                <div className="grid grid-cols-3 gap-1 bg-slate-200/50 p-1 rounded-md">
                  {(["formal", "ramah", "sangat sederhana"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => handlePreferenceChange(t, lengthMode)}
                      className={`py-1 px-1 text-[10px] rounded font-medium capitalize transition-all ${
                        tone === t
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-white/50"
                      }`}
                    >
                      {t === "sangat sederhana" ? "Awam" : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Length selector */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                <p className="text-[11px] font-semibold text-slate-500">Kedalaman Informasi</p>
                <div className="grid grid-cols-3 gap-1 bg-slate-200/50 p-1 rounded-md">
                  {(["ringkas", "standar", "detail"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => handlePreferenceChange(tone, l)}
                      className={`py-1 px-1 text-[10px] rounded font-medium capitalize transition-all ${
                        lengthMode === l
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-white/50"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick legal topics triggers */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Masalah Utama Anda</label>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { title: "Saya Kena Penipuan", desc: "Transaksi online / arisan", prompt: "Saya baru saja terkena penipuan penawaran online secara mendadak. Pelaku mengirimkan nomor rekening bank dan bukti transaksi palsu. Tolong bantu berikan langkah-langkah hukum darurat untuk memperjuangkan hak saya." },
                { title: "Sengketa Kontrak Kerja / PHK", desc: "Pemberhentian sepihak", prompt: "Saya sedang mengalami sengketa hubungan industrial dengan pihak manajemen tempat saya bekerja karena terancam PHK sepihak tanpa diberi uang penghargaan masa kerja atau surat peringatan layak. Apa hak perlindungan saya?" },
                { title: "Masalah Kontrak Sewa", desc: "Perselisihan sewa properti", prompt: "Saya sedang berseteru dalam masalah perjanjian sewa properti. Pemilik properti menolak mengembalikan uang jaminan (deposit sewa) saya tanpa alasan yang sah padahal masa kontrak telah selesai. Bagaimana aspek perdata mengaturnya?" },
                { title: "Sengketa Batas Tetangga", desc: "Tiris air, kebisingan", prompt: "Tetangga saya melakukan renovasi bangunan secara ekstrem yang berakibat air tirisan atap dan dindingnya retak meluber merugikan pekarangan saya secara struktural. Bagaimana penyelesaian yang sesuai aturan bertetangga?" }
              ].map((topic, i) => (
                <button
                  key={i}
                  onClick={() => triggerChatMessage(topic.prompt)}
                  className="w-full text-left p-2.5 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all group flex flex-col gap-0.5"
                >
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 flex items-center justify-between">
                    {topic.title}
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                  </span>
                  <span className="text-[10px] text-slate-400">{topic.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Memory constraints */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700">Simpan Konteks Kasus</p>
                <p className="text-[10px] text-slate-400 leading-tight">Mengingat detail sengketa Anda saat ini</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberEnabled}
                  onChange={(e) => handleToggleRemember(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {rememberEnabled && sessionSummary && (
              <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-[10px] text-blue-800 leading-snug">
                <strong>Rangkuman Kasus Aktif:</strong> {sessionSummary}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Mobile/Desktp Safety Disclaimer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-amber-50/30 p-3 rounded-lg border border-amber-100 text-[10px] text-slate-500 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer Resmi:</strong> Hak.Ku menyajikan edukasi hukum dasar umum. Ini bukan nasihat hukum formal pengganti advokat legal berlisensi.
            </p>
          </div>
        </div>
      </aside>

      {/* CORE MIDDLE WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Header bar */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white z-20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
              <span className="absolute top-0 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">Hak.Ku Layanan Aktif</span>
              <span className="text-[10px] text-slate-400 font-medium">Konsultasi Panduan Hukum Awal Indonesia</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 border border-slate-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset Riwayat Chat
            </button>
          </div>
        </header>

        {/* Center Canvas Workspace divided into Left (Chats) / Right (Grounded Analysis & Directory) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT CHATS VIEWPORT */}
          <section className="flex-1 flex flex-col justify-between bg-slate-50 border-r border-slate-100 h-full p-4 md:p-6 overflow-hidden">
            
            {/* Message Thread Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              
              {/* Default Welcome Greetings if empty */}
              {messages.length === 0 ? (
                <div className="max-w-2xl mx-auto py-10 space-y-6 text-center md:text-left">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 md:p-8 rounded-3xl space-y-4 shadow-xl shadow-blue-100">
                    <p className="text-2xl font-bold tracking-tight">Halo! Saya Hak.Ku 👋</p>
                    <p className="text-sm text-blue-50 leading-relaxed font-normal">
                      Asisten Kecerdasan Buatan (AI) yang siap menjelaskan aspek sengketa hukum sehari-hari, istilah perundang-undangan rumit, serta hak-hak dasar Anda secara ramah, ringan, berempati, dan sangat mudah dipahami oleh masyarakat awam.
                    </p>
                    <p className="text-xs text-blue-100/90 leading-relaxed">
                      Silakan pilih topik cepat di samping, tanyakan langsung keluhan Anda, atau drag & drop file draf surat perjanjian sewaan / kertas kerja Anda di bawah untuk menguraikan pasal-pasal mencurigakan secara otomatis!
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Gunakan Pertanyaan Contoh</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sampleSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => triggerChatMessage(s.text)}
                          className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/20 text-left text-xs font-medium text-slate-700 transition-all flex items-center justify-between"
                        >
                          <span>{s.text}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{s.icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-4 pb-20">
                  {messages.map((m, index) => (
                    <div
                      key={index}
                      className={`flex gap-3.5 max-w-[85%] ${
                        m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                          m.role === "user"
                            ? "bg-slate-200 text-slate-600"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {m.role === "user" ? <User className="w-4 h-4" /> : "HK"}
                      </div>
                      
                      {/* Chat text box */}
                      <div
                        className={`p-4 md:p-5 rounded-2xl border leading-relaxed text-sm ${
                          m.role === "user"
                            ? "bg-blue-600 text-white border-blue-500 rounded-tr-none font-medium shadow-md shadow-blue-50/50"
                            : "bg-white text-slate-800 border-slate-200 rounded-tl-none shadow-sm whitespace-pre-wrap"
                        }`}
                      >
                        {m.role === "user" ? (
                          m.content
                        ) : (
                          // Premium inline and structured markdown block renderer
                          m.content.split("\n").map((line, lIdx) => renderFormattedLine(line, lIdx))
                        )}
                        <span className="block text-[9px] mt-2 opacity-50 text-right">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex gap-3.5 max-w-[85%] mr-auto">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-blue-600 text-white text-xs font-bold animate-pulse">HK</div>
                      <div className="bg-white text-slate-500 p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-xs font-semibold">Hak.Ku sedang meneliti instrumen hukum terkait...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom dynamic input panel */}
            <div className="mt-2 bg-white rounded-2xl border-2 border-slate-200 focus-within:border-blue-500 shadow-sm transition-all p-2 relative group">
              
              {/* Drag file banner over input if dragging */}
              {isDraggingDoc && (
                <div className="absolute inset-0 bg-blue-500/90 text-white rounded-xl flex items-center justify-center gap-3 z-30 font-bold text-sm animate-pulse">
                  <FolderOpen className="w-5 h-5" /> Letakkan draf dokumen hukum di sini untuk memindai...
                </div>
              )}

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="flex items-end gap-2"
              >
                {/* Paperclip upload simulation */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all self-center relative"
                  title="Upload surat kontrak (PDF, Word, TXT) untuk diperiksa"
                >
                  {ocrLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                </button>

                <textarea
                  value={inputMessage || ""}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      triggerChatMessage();
                    }
                  }}
                  rows={2}
                  className="flex-1 p-2 bg-transparent resize-none focus:outline-none text-sm text-slate-800"
                  placeholder="Ketik keluhan hukum Anda di sini (Maksimal input bebas)... tekan Enter"
                />

                <button
                  disabled={loading || !inputMessage.trim()}
                  onClick={() => triggerChatMessage()}
                  className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-200 disabled:shadow-none transition-all flex item-center justify-center"
                >
                  <Send className="w-4 h-4 translate-x-px" />
                </button>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between mt-1 px-1.5 text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 
                  {scannedFilename ? `Dokumen terlampir: ${scannedFilename}` : "Grounding database hukum tersedia"}
                </span>
                <span>Enter untuk kirim • Seret / Upload file PDF/Doc</span>
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR: EXCLUSIVE ADAPTIVE SUMMARY PANEL & DIRECTORY */}
          <section className="w-[400px] hidden lg:flex flex-col border-l border-slate-200 bg-slate-50/50 p-5 overflow-y-auto space-y-6">
            
            {/* Dynamic Analysis/OCR Summary Bento Card */}
            {ocrResult ? (
              <div className="bg-white border-l-4 border-emerald-500 shadow-md rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 p-1.5 rounded text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-xs">Penelaahan Dokumen</h3>
                      <p className="text-[10px] text-slate-400">{scannedFilename}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setOcrResult(null);
                      setScannedFilename("");
                    }}
                    className="text-[10px] text-slate-400 hover:text-red-500 font-semibold"
                  >
                    Tutup
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-emerald-50/30 p-2.5 rounded border border-emerald-100/50">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">Jenis Dokumen</span>
                    <p className="text-xs font-bold text-slate-700">{ocrResult.documentType}</p>
                  </div>

                  {/* Risks Alert box */}
                  {ocrResult.risksDetected && ocrResult.risksDetected.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" /> Klausul Berisiko Tinggi
                      </span>
                      <ul className="text-[11px] text-slate-600 space-y-1.5 bg-red-50/40 p-2.5 rounded border border-red-100/50">
                        {ocrResult.risksDetected.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-red-500 mr-0.5">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Priority Actions */}
                  {ocrResult.recommendations && ocrResult.recommendations.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Rekomendasi Revisi Kontrak</span>
                      <ul className="text-[11px] text-slate-600 space-y-1.5 bg-slate-50/80 p-2.5 rounded border border-slate-200">
                        {ocrResult.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-emerald-500 mr-0.5 font-bold">✔</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key articles table */}
                  {ocrResult.keyArticles && ocrResult.keyArticles.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pasal Penting Terdeteksi</span>
                      <div className="space-y-1.5 text-[11px] text-slate-700 bg-slate-100/50 p-2.5 rounded">
                        {ocrResult.keyArticles.map((art, idx) => (
                          <div key={idx} className="pb-1 border-b border-slate-200/50 last:border-0 last:pb-0">
                            <strong>{art.num}:</strong> {art.summary}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Empty OCR instructions
              <div className="bg-white border border-slate-200 rounded-xl p-5 text-center space-y-3 shadow-sm">
                <FileText className="w-8 h-8 text-blue-500 mx-auto opacity-75" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Analisis Surat Kontrak Pintar</h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1">
                    Seret atau upload salinan kontrak kerja (PKWT), sewa-menyewa, atau kesepakatan utang Anda kesini demi membedah risiko denda tersembunyi secara otomatis.
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-1.5 px-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[11px] font-bold transition-colors w-full"
                >
                  Pilih Berkas Sekarang
                </button>
              </div>
            )}

            {/* Curated LBH official Directory search bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800">Direktori Advokasi Hukum Gratis</h3>
              </div>
              
              <div className="space-y-3">
                {/* City selection filter */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Pilih Wilayah Anda</p>
                  <div className="flex flex-wrap gap-1">
                    {["Semua", "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Makassar", "Medan"].map((city) => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`px-2 py-0.5 text-[9px] rounded-full font-semibold border transition-all ${
                          selectedCity === city
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Directory list scroll */}
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {loadingLBH ? (
                    <div className="py-8 text-center text-xs text-slate-400">Loading directory...</div>
                  ) : lbhList.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400">Lembaga tidak ditemukan.</div>
                  ) : (
                    lbhList.map((lbh, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-1.5 hover:border-blue-300 transition-colors">
                        <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded uppercase">{lbh.city}</span>
                        <h4 className="text-[11px] font-bold text-slate-800 leading-tight">{lbh.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{lbh.address}</p>
                        
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/50">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Phone className="w-3 h-3 text-emerald-600" /> {lbh.phone}
                          </span>
                          <a
                            href={lbh.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            Hubungi <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Legal Terms Wiki */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-indigo-50 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-300" />
                <h4 className="text-xs font-bold">Kamus Istilah Sederhana</h4>
              </div>
              <p className="text-[11px] text-indigo-200 leading-relaxed">
                Asas-asas hukum penting yang perlu Anda pahami:
              </p>
              <div className="space-y-2 text-[10px]">
                <div className="bg-indigo-950/40 p-2 rounded">
                  <span className="text-indigo-300 font-bold">Pacta Sunt Servanda</span>
                  <p className="text-indigo-200/80">Janji/kontrak mengikat pembuatnya setara konstitusi negara.</p>
                </div>
                <div className="bg-indigo-950/40 p-2 rounded">
                  <span className="text-indigo-300 font-bold">Gugatan PMH (1365 Perdata)</span>
                  <p className="text-indigo-200/80">Menuntut ganti kerugian krn perbuatan tetangga/pihak luar yg merusak.</p>
                </div>
              </div>
            </div>

          </section>

        </div>

      </main>

      {/* Custom Confirmation Modal for Cleardown to bypass iframe sandbox warning blockages */}
      {showClearConfirm && (
        <div id="clear-confirm-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 transition-all">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-150 space-y-4 transform scale-100 transition-all">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Hapus Riwayat Chat?</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Seluruh riwayat obrolan hukum, dokumen terlampir, serta analisis sengketa aktif Anda akan dihapus permanen dari server asisten **Hak.Ku**. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Batalkan
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md shadow-red-200 transition-colors"
                id="modal-confirm-delete"
              >
                Ya, Hapus Sesi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
