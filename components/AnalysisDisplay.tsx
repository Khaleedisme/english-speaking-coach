import React, { useState } from 'react';
import { AnalysisResult, BilingualText } from '../types';
import { AlertCircle, CheckCircle, BookOpen, Volume2, Mic, Activity, ArrowRight, Globe } from 'lucide-react';

interface AnalysisDisplayProps {
  data: AnalysisResult;
  onBack: () => void;
  initialLang?: 'en' | 'az';
}

// Helper for UI labels
const LABELS = {
  en: {
    sessionAnalysis: "Session Analysis",
    mainStrength: "Main Strength",
    priorityFocus: "Priority Focus",
    actionItems: "Action Items",
    pronunciation: "Pronunciation",
    issuesFound: "Issues Found",
    suggestions: "Suggestions",
    grammar: "Grammar",
    errorsIdentified: "Errors Identified",
    patternsToWatch: "Patterns to Watch",
    vocabulary: "Vocabulary & Expression",
    improvements: "Improvements",
    excellentUsage: "Excellent Usage",
    polishedVersion: "Polished Version",
    originalTranscription: "Original Transcription",
    fluencyAnalysis: "Fluency Analysis",
    back: "Back to Dashboard",
    noIssues: "No major issues detected.",
    greatGrammar: "Great grammar usage!",
    solidVocab: "Solid vocabulary choices."
  },
  az: {
    sessionAnalysis: "Sessiya Analizi",
    mainStrength: "Əsas Güc",
    priorityFocus: "Diqqət Mərkəzi",
    actionItems: "Tapşırıqlar",
    pronunciation: "Tələffüz",
    issuesFound: "Tapılan Səhvlər",
    suggestions: "Tövsiyələr",
    grammar: "Qrammatika",
    errorsIdentified: "Tapılan Xətalar",
    patternsToWatch: "Təkrarlanan Nümunələr",
    vocabulary: "Lüğət və İfadə",
    improvements: "Təkmilləşdirmələr",
    excellentUsage: "Əla İstifadə",
    polishedVersion: "Düzəliş Edilmiş Versiya",
    originalTranscription: "Orijinal Transkripsiya",
    fluencyAnalysis: "Səlislik Analizi",
    back: "Ana Səhifəyə Qayıt",
    noIssues: "Ciddi problem aşkar edilmədi.",
    greatGrammar: "Əla qrammatika istifadəsi!",
    solidVocab: "Yaxşı lüğət seçimi."
  }
};

const ScoreCard: React.FC<{ label: string; score: number; color: string; icon: React.ElementType }> = ({ label, score, color, icon: Icon }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <span className="font-medium text-slate-700">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-slate-900">{score}</span>
      <span className="text-sm text-slate-400">/10</span>
    </div>
  </div>
);

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data, onBack, initialLang = 'en' }) => {
  const [lang, setLang] = useState<'en' | 'az'>(initialLang);
  const t = LABELS[lang];

  // Helper to safely get text
  const getText = (obj: BilingualText | string) => {
    if (typeof obj === 'string') return obj;
    return obj[lang];
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 relative">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          {t.back}
        </button>

        {/* Language Toggle */}
        <button
          onClick={() => setLang(l => l === 'en' ? 'az' : 'en')}
          className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm hover:bg-slate-50 transition-all font-medium text-sm text-slate-700"
        >
          <Globe className="w-4 h-4 text-blue-600" />
          <span>{lang === 'en' ? '🇺🇸 English' : '🇦🇿 Azərbaycanca'}</span>
        </button>
      </div>

      {/* Header Summary */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t.sessionAnalysis}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium 
                ${data.overallAssessment.clarityRating === 'Clear' ? 'bg-green-100 text-green-700' : 
                  data.overallAssessment.clarityRating === 'Mostly Clear' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                {data.overallAssessment.clarityRating}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg mb-6">
              {getText(data.overallAssessment.summary)}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-green-50 rounded-lg border border-green-100">
                <span className="block text-xs text-green-600 font-semibold uppercase tracking-wide">{t.mainStrength}</span>
                <span className="text-green-900 font-medium">{getText(data.overallAssessment.mainStrength)}</span>
              </div>
              <div className="px-4 py-2 bg-amber-50 rounded-lg border border-amber-100">
                <span className="block text-xs text-amber-600 font-semibold uppercase tracking-wide">{t.priorityFocus}</span>
                <span className="text-amber-900 font-medium">{getText(data.overallAssessment.priorityFocus)}</span>
              </div>
            </div>
          </div>
          
          {/* Action Items Quick View */}
          <div className="w-full md:w-1/3 bg-slate-50 rounded-xl p-5 border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              {t.actionItems}
            </h3>
            <ul className="space-y-2">
              {data.actionItems.map((item, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                  {getText(item)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <ScoreCard label={t.pronunciation} score={data.pronunciation.score} color="bg-blue-500" icon={Mic} />
        <ScoreCard label={t.grammar} score={data.grammar.score} color="bg-purple-500" icon={BookOpen} />
        <ScoreCard label="Vocabulary" score={data.vocabulary.score} color="bg-emerald-500" icon={AlertCircle} />
        <ScoreCard label="Fluency" score={data.fluency.score} color="bg-orange-500" icon={Activity} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          
          {/* Pronunciation Section */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800">{t.pronunciation}</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.issuesFound}</h3>
                {data.pronunciation.issues.length > 0 ? (
                  <ul className="space-y-3">
                    {data.pronunciation.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-red-50 p-3 rounded-lg text-sm">
                        <Volume2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-red-800 block mb-1">"{issue.error}"</span>
                          <span className="text-red-700">{issue.example}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 italic">{t.noIssues}</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.suggestions}</h3>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {data.pronunciation.suggestions.map((s, i) => (
                    <li key={i}>{getText(s)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Grammar Section */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-purple-50 p-4 border-b border-purple-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-slate-800">{t.grammar}</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.errorsIdentified}</h3>
                 {data.grammar.errors.length > 0 ? (
                  <div className="space-y-3">
                    {data.grammar.errors.map((err, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                         <div className="flex flex-col gap-1 mb-2">
                           <span className="line-through text-slate-400 decoration-red-400 decoration-2">{err.original}</span>
                           <span className="font-medium text-green-600 flex items-center gap-1">
                             <ArrowRight className="w-3 h-3" /> {err.correction}
                           </span>
                         </div>
                         <p className="text-slate-500 text-xs italic">{getText(err.explanation)}</p>
                      </div>
                    ))}
                  </div>
                 ) : (
                   <p className="text-slate-500 italic">{t.greatGrammar}</p>
                 )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.patternsToWatch}</h3>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {data.grammar.patterns.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
           {/* Vocabulary Section */}
           <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-800">{t.vocabulary}</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.improvements}</h3>
                {data.vocabulary.issues.length > 0 ? (
                   <div className="space-y-3">
                     {data.vocabulary.issues.map((issue, idx) => (
                       <div key={idx} className="text-sm">
                         <div className="flex items-center gap-2 mb-1">
                           <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{issue.phrase}</span>
                           <ArrowRight className="w-3 h-3 text-slate-400" />
                           <span className="bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 font-bold">{issue.betterAlternative}</span>
                         </div>
                         <p className="text-slate-500 text-xs ml-1">{getText(issue.reason)}</p>
                       </div>
                     ))}
                   </div>
                ) : (
                  <p className="text-slate-500 italic">{t.solidVocab}</p>
                )}
              </div>
              <div className="mb-6">
                 <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.excellentUsage}</h3>
                 <div className="flex flex-wrap gap-2">
                   {data.vocabulary.excellentUsage.map((w, i) => (
                     <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">{w}</span>
                   ))}
                 </div>
              </div>
            </div>
          </section>

          {/* Corrected Version Section */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 p-4 flex items-center gap-2">
              <span className="text-yellow-400">✨</span>
              <h2 className="font-bold text-white">{t.polishedVersion}</h2>
            </div>
            <div className="p-6 bg-slate-50">
              <p className="text-slate-700 leading-relaxed font-serif text-lg italic">
                "{data.correctedVersion}"
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200">
                 <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">{t.originalTranscription}</h4>
                 <p className="text-slate-500 text-sm">{data.transcription}</p>
              </div>
            </div>
          </section>

          {/* Fluency */}
           <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <div className="flex items-center gap-2 mb-3">
               <Activity className="w-5 h-5 text-orange-500" />
               <h2 className="font-bold text-slate-800">{t.fluencyAnalysis}</h2>
             </div>
             <p className="text-slate-700">{getText(data.fluency.assessment)}</p>
           </section>

        </div>
      </div>
    </div>
  );
};

export default AnalysisDisplay;