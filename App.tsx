import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, History, Plus, FileAudio, Loader2, Trash2, Download, Upload } from 'lucide-react';
import AudioRecorder from './components/AudioRecorder';
import AnalysisDisplay from './components/AnalysisDisplay';
import HistoryChart from './components/HistoryChart';
import { analyzeAudio } from './services/geminiService';
import { AnalysisResult, HistoryItem } from './types';

function App() {
  const [view, setView] = useState<'dashboard' | 'analysis' | 'record'>('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  
  // Lazy initialization ensures we read from localStorage before the first render
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('esc_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse history");
          return [];
        }
      }
    }
    return [];
  });

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('esc_history', JSON.stringify(history));
  }, [history]);

  const saveToHistory = (result: AnalysisResult) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      // Store EN version for summary in list, assume EN exists
      summary: result.overallAssessment.summary.en,
      priorityFocus: result.overallAssessment.priorityFocus.en,
      scores: {
        pronunciation: result.pronunciation.score,
        grammar: result.grammar.score,
        vocabulary: result.vocabulary.score,
        fluency: result.fluency.score,
      },
    };
    // Use functional update to ensure we always have the latest state
    setHistory(prev => [newItem, ...prev]);
  };
  
  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your entire practice history?")) {
      setHistory([]);
    }
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coach-ai-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerImport = () => {
    importInputRef.current?.click();
  };

  const importHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          // Simple validation check
          if (parsed.length > 0 && !parsed[0].id) {
            alert("Invalid history file format.");
            return;
          }
          if (confirm(`Found ${parsed.length} sessions. Do you want to replace your current history with this?`)) {
             setHistory(parsed);
          }
        } else {
          alert("Invalid file structure.");
        }
      } catch (err) {
        console.error("Failed to parse history file", err);
        alert("Failed to import history. Invalid file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const handleAudioSubmit = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      // Pass the existing history to the service for context
      const result = await analyzeAudio(blob, history);
      setCurrentAnalysis(result);
      saveToHistory(result);
      setView('analysis');
    } catch (error) {
      console.error(error);
      alert("Failed to analyze audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAudioSubmit(file);
    }
    event.target.value = '';
  };

  const renderDashboard = () => (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Hello, Khalid.</h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-xl leading-relaxed">
            Ready to improve your English today? Your goal is clear pronunciation and native-like expression.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
             <button 
               onClick={() => setView('record')}
               className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-full font-bold transition-all shadow-sm flex items-center gap-2"
             >
               <Plus className="w-5 h-5" />
               New Practice Session
             </button>
             <label className="bg-blue-800 bg-opacity-40 hover:bg-opacity-60 text-white px-6 py-3 rounded-full font-medium transition-all cursor-pointer flex items-center gap-2">
               <FileAudio className="w-5 h-5" />
               Upload Audio
               <input 
                 type="file" 
                 accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.flac,.aac" 
                 className="hidden" 
                 onChange={handleFileUpload} 
               />
             </label>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
          <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M45.7,-70.5C58.9,-62.5,69.3,-49.4,75.9,-34.7C82.5,-20,85.4,-3.7,81.6,11.2C77.8,26.1,67.3,39.6,55.5,50.7C43.7,61.8,30.6,70.5,15.7,73.8C0.8,77.1,-15.9,75,-30.9,69.1C-45.9,63.2,-59.2,53.5,-68.6,40.8C-78,28.1,-83.5,12.4,-81.9,-2.6C-80.3,-17.6,-71.6,-31.9,-60.1,-42.6C-48.6,-53.3,-34.3,-60.4,-19.9,-67.2C-5.5,-74,9,-80.5,23.1,-80.5C37.2,-80.5,50.9,-74,45.7,-70.5Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
           <HistoryChart history={history} />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              Recent Sessions
            </h3>
            <div className="flex items-center gap-1">
               <input 
                 type="file" 
                 accept=".json" 
                 className="hidden" 
                 ref={importInputRef} 
                 onChange={importHistory} 
               />
               <button 
                 onClick={exportHistory}
                 disabled={history.length === 0}
                 className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition-colors disabled:opacity-30"
                 title="Backup History"
               >
                 <Download className="w-4 h-4" />
               </button>
               <button 
                 onClick={triggerImport}
                 className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition-colors"
                 title="Restore History"
               >
                 <Upload className="w-4 h-4" />
               </button>
               {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-colors"
                  title="Clear History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {history.length > 0 ? (
              history.slice(0, 5).map(item => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-blue-50 transition-colors cursor-default">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-500">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs bg-white border px-2 py-0.5 rounded text-slate-600">
                      Avg: {Math.round((item.scores.pronunciation + item.scores.grammar + item.scores.vocabulary + item.scores.fluency) / 4)}/10
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">{item.summary}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm italic">
                <p>No practice sessions yet.</p>
                <p>Start your first one!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      {/* Global Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center max-w-sm text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Audio</h3>
              <p className="text-slate-500">Please wait while our AI coach evaluates your pronunciation, grammar, and fluency...</p>
           </div>
        </div>
      )}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => !isProcessing && setView('dashboard')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
              <span className="font-bold text-xl tracking-tight text-slate-800">Coach<span className="text-blue-600">AI</span></span>
            </div>
            {view !== 'dashboard' && (
              <button 
                onClick={() => !isProcessing && setView('dashboard')} 
                className={`text-slate-500 hover:text-blue-600 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isProcessing}
              >
                <LayoutDashboard className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'dashboard' && renderDashboard()}
        
        {view === 'record' && (
          <div className="flex flex-col items-center pt-12 animate-fade-in">
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Today's Practice</h2>
             <p className="text-slate-500 mb-8 text-center max-w-md">Record yourself speaking for 1-2 minutes. You can talk about your day, describe a picture, or summarize a news article.</p>
             <AudioRecorder onRecordingComplete={handleAudioSubmit} isProcessing={isProcessing} />
          </div>
        )}

        {view === 'analysis' && currentAnalysis && (
          <AnalysisDisplay 
            data={currentAnalysis} 
            onBack={() => setView('dashboard')} 
          />
        )}
      </main>
    </div>
  );
}

export default App;