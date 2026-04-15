
import React, { useState, useEffect } from 'react';
import { LevelContent, Question } from '../types';
import { getAIFeedback } from '../services/geminiService';
import "./dashbord.css"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api';

interface Props {
  content: LevelContent;
  onComplete: () => void;
}
type Step = 'video' | 'flashcards' | 'books' | 'audio' | 'practice';

type BookLevel = 'level1' | 'domain' | 'advanced';




const LearningModule: React.FC<Props> = ({ content, onComplete }) => {
  const navigate = useNavigate();

  //video src fetching

  const [videostate, setvideostate] = useState([]);


  const fetchvideo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/view-videos`)
      setvideostate(res.data);
    }
    catch (err) {
      console.error("video not found");
    }
  }

  useEffect(() => {
    fetchvideo();
  }, [])


  const [step, setStep] = useState<Step>(content.videoUrl ? 'video' : 'flashcards');
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
const [keywords, setKeywords] = useState<string[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [totalKeywords, setTotalKeywords] = useState(0);
  const [loadingAI, setLoadingAI] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [currentAudioModule, setCurrentAudioModule] = useState(0);
  const [currentAudioIdx, setCurrentAudioIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const BOOK_BY_ID: Record<string, string[]> = {
    beginner: ['/books/level1_prompt_engineering.pdf',
      '/books/prompt_engineering_book_1.pdf',
      '/books/how_to_write_prompt.pdf',

    ],
    

    'content-writing': ['/books/domain_prompt_engineering.pdf'],
    'marketing': ['/books/domain_prompt_engineering.pdf'],
    'coding': ['/books/domain_prompt_engineering.pdf'],
    'data-analysis': ['/books/domain_prompt_engineering.pdf'],
    'education': ['/books/domain_prompt_engineering.pdf'],
    'business': ['/books/domain_prompt_engineering.pdf'],
    'fashion' : ['/books/domain_prompt_engineering.pdf'],
    'health' : ['/books/domain_prompt_engineering.pdf'],




    'advanced-content-writing': ['/books/contentwriting.pdf'],
    'advanced-marketing' : ['/books/marketing.pdf'],
    'advanced-coding' : ['/books/ADVANCEDCODINGANDDEVELOPMENT.pdf'],
    'advanced-data-analytics' : ['/books/ADVANCEDDATAANAYLSIS.pdf'],
    'advanced-education' : ['/books/education.pdf'],
    'advanced-business' : ['/books/'],
    'advanced-fashion' : ['/books/fashion.pdf'],
    'advanced-health' : ['/books/Advancedhealthcare.pdf'],
  };





  // If level has no video, skip to flashcards
  useEffect(() => {
    if (!content.videoUrl && step === 'video') {
      setStep('flashcards');
    }
  }, [content.videoUrl, step]);



  const handleNextCard = () => {
    if (currentCardIdx < content.flashcards.length - 1) {
      setCurrentCardIdx(currentCardIdx + 1);
    } else {
      setStep('books'); // flashcards ke baad books
    }
  };


  const handleAnswer = (val: number | string) => {
    if (submitted) return; // prevent change after submit
    const question = content.practiceQuestions[currentQuestionIdx];
    setAnswers({ ...answers, [question.id]: val });
  };

const computeKeywordsScore = (question: Question, userAnswer: string) => {
    if (question.type === 'prompt-writing' && question.keywords) {
      const userLower = userAnswer.toLowerCase().trim();
      let kwArray: string[];
      if (Array.isArray(question.keywords)) {
        kwArray = question.keywords.map(k => k.toLowerCase().trim()).filter(Boolean);
      } else if (typeof question.keywords === 'string') {
        kwArray = question.keywords.split(',').map(k => k.toLowerCase().trim()).filter(Boolean);
      } else {
        kwArray = [];
      }
      const totalKeywords = kwArray.length;
      const matchedKeywords = kwArray.filter(kw => userLower.includes(kw)).length;
      const newScore = totalKeywords > 0 ? Math.round((matchedKeywords / totalKeywords) * 100) : 0;
      setMatchedCount(matchedKeywords);
      setTotalKeywords(totalKeywords);
      setScore(newScore);
      setKeywords(kwArray.map(kw => kw.charAt(0).toUpperCase() + kw.slice(1)));
    } else {
      setScore(null);
      setKeywords([]);
      setMatchedCount(0);
      setTotalKeywords(0);
    }
  };


  const handleAIFeedback = async () => {
    const question = content.practiceQuestions[currentQuestionIdx];
    const userAnswer = answers[question.id] as string;
    if (!userAnswer) return;

    setLoadingAI(true);
    const aiResp = await getAIFeedback(userAnswer, question.text) || "Analyzing your prompt...";
    setFeedback(aiResp);
    setLoadingAI(false);
  };


  const nextQuestion = () => {
    setFeedback(null);
    setSubmitted(false);
    if (currentQuestionIdx < content.practiceQuestions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      return;
    } const confirmStart = window.confirm(
      "You completed the Skill Lab.\nFinal Exam will start now and you cannot leave midway.\nDo you want to continue?"
    );

    if (confirmStart) {
// 🚀 GUARANTEED SAVE - Creates row + auto-generates certs
      const saveProgress = async () => {
        const token = localStorage.getItem('token');
        if (!token || !content.id) {
          onComplete();
          return;
        }
        
        try {
          const res = await fetch(`${API_BASE_URL}/save-progress`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              completedLevels: [content.id],
              currentLevelId: content.id,
              certifications: [] // Backend auto-generates these
            })
          });
          const data = await res.json();
          console.log('✅ Progress SAVED + CERTS GENERATED:', data);
        } catch (err) {
          console.error('Save failed (continuing):', err);
        } finally {
          onComplete(); // Always continue
        }
      };
      saveProgress();
    }
  };




  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-10 overflow-x-auto py-2" style={{ gap: "1vw" }}>
      {[
        { id: 'video', label: '1. Video Lab', icon: '📺', disabled: !content.videoUrl },
        { id: 'flashcards', label: content.videoUrl ? '2. Core Concepts' : '1. Core Concepts', icon: '🧠', disabled: false },
        { id: 'books', label: content.videoUrl ? '3. Books' : '2. Books', icon: '📚', disabled: false },
        {
          id: 'audio',
          label: content.videoUrl ? '4. Audio' : '3. Audio',
          icon: '🎧',
          disabled: false
        },
        { id: 'practice', label: content.videoUrl ? '5. Skill Lab' : '4. Skill Lab', icon: '🧪', disabled: false }
      ].filter(s => !s.disabled).map((s) => (
        <div
          key={s.id}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${step === s.id
            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-105'
            : 'bg-white border-gray-100 text-gray-400'
            }`}

        >
          <span className="text-lg">{s.icon}</span>
          <span className="text-sm font-bold">{s.label}</span>
        </div>
      ))}
    </div>
  );

  if (step === 'video' && content.videoUrl) {
    return (
      <div className="max-w-4xl mx-auto mt-6 px-4 py-12" style={{ borderRadius: "40px", boxShadow: "0 6px 18px rgba(255,255,255,0.8)", paddingLeft: "2vw", paddingRight: "2vw" }}>
        <StepIndicator />
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-gray-100 text-center" style={{ display: "flex", flexDirection: "column", boxShadow: "0 6px 18px rgba(255,255,255,0.3)" }}>
          <h2 className="text-3xl font-black text-gray-900 mb-6">{content.videoTitle || 'Learning Masterclass'}</h2>
          <p className="text-gray-500 mb-10 text-lg">Please watch the following learning video carefully before moving ahead.</p>

          <div className="flex flex-col gap-10 mb-12">
            {videoLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-50 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-sm font-bold text-gray-400 animate-pulse">Initializing Video Stream...</p>
              </div>
            )}

            {videostate.map((y: any) => (
              <div
                key={y.id}
                className="w-full rounded-[2rem] overflow-hidden shadow-xl border"
              >
                <iframe
                  className="w-full aspect-video"
                  src={y.video}
                  title={y.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  onLoad={() => setVideoLoading(false)}
                ></iframe>
              </div>
            ))}

          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Finished watching?</p>
            <button
              id='video'
              onClick={() => setStep('flashcards')}
              className="px-20 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 shadow-2xl transition-all active:scale-95 flex items-center gap-4"
            >
              DONE
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5-5 5M6 7l5 5-5 5"></path></svg>
            </button>
            <p className="text-xs text-gray-400 mt-4 italic">Note: If the video doesn't start automatically, please click the play button manually.</p>
          </div>
        </div>
      </div>
    );
  }




  if (step === 'flashcards') {
    const card = content.flashcards[currentCardIdx];
    return (
      <div className="max-w-4xl mx-auto mt-6 px-4 py-12" style={{ borderRadius: "40px", boxShadow: "0 6px 18px rgba(255,255,255,0.8)", paddingLeft: "2vw", paddingRight: "2vw" }}>
        <StepIndicator />
        <div className="mb-10 text-center">
          <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3">Module: Core Insights</p>
          <div className="w-full bg-gray-100 h-4 rounded-full max-w-xs mx-auto overflow-hidden">
            <div className="bg-indigo-600  h-full transition-all duration-500 shadow-sm" style={{ width: `${((currentCardIdx + 1) / content.flashcards.length) * 100}%`,border:"solid 2px #fff" ,boxShadow:"0 2px 4px rgba(255,255,255,0.8)" }}></div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl p-14 min-h-[450px] flex flex-col justify-center border border-indigo-50 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
          </div>
          <h2 className="text-5xl font-black text-gray-900 mb-8 tracking-tight">{card.title}</h2>
          <p className="text-2xl text-gray-600 leading-relaxed mb-10 font-medium">{card.content}</p>
          {card.example && (
            <div className="bg-indigo-50 rounded-[2rem] p-8 border-l-8 border-indigo-600 text-left max-w-2xl mx-auto shadow-sm">
              <p className="text-indigo-900 font-black mb-2 text-xs uppercase tracking-widest">Case Study:</p>
              <p className="text-xl text-indigo-800 italic leading-snug">"{card.example}"</p>
            </div>
          )}
        </div>

        <div className="mt-14 flex justify-center gap-6">
          <button
            id="video2"
            onClick={() => currentCardIdx > 0 ? setCurrentCardIdx(v => v - 1) : (content.videoUrl && setStep('video'))}
            className="px-10 py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-[1.5rem] font-black hover:bg-gray-50 hover:text-gray-600 transition-all"
          >
            Previous
          </button>
          <button
            id='btn1'
            onClick={handleNextCard}
            className="px-16 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-700 shadow-2xl transition-all flex items-center gap-4 transform active:scale-95"
          >
            {currentCardIdx === content.flashcards.length - 1 ? 'Go to Skill Lab' : 'Next Concept'}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5-5 5M6 7l5 5-5 5"></path></svg>
          </button>
        </div>
      </div>
    );
  }
  if (step === 'books') {
    const books = BOOK_BY_ID[content.id] || [];

    return (
      <div className="max-w-4xl mx-auto mt-6 px-4 py-12" style={{ borderRadius: "40px", boxShadow: "0 6px 18px rgba(255,255,255,0.8)", paddingLeft: "2vw", paddingRight: "2vw" }}>
        <StepIndicator />

        <h2 className="text-4xl font-black text-center mb-12 text-gray-900" style={{ padding: "1vw", background: "white", borderRadius: "20px", boxShadow: "0 4px 10px rgba(255,255,255,0.5)" }}>
          📚 Learning Books
        </h2>

        {books.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8 justify-center">
            {books.map((bookUrl, index) => (
              <div
                key={index}
                style={{ boxShadow: "0 6px 18px rgba(255,255,255,0.5)" }}
                onClick={() => window.open(bookUrl, '_blank')}
                className="bg-white rounded-3xl shadow-xl p-10 text-center border cursor-pointer hover:shadow-2xl transition"
              >
                <h3 className="text-2xl font-black mb-4">
                  {content.name} – Book {index + 1}
                </h3>
                <p className="text-gray-600 text-lg">
                  Open learning book for this module
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">
            No books available for this module.
          </p>
        )}

        <div className="mt-14 flex justify-center">
          <button
            id='video2'
            onClick={() => setStep('audio')}
            className="px-14 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition"
          >
            Continue to Audio Lectures 🎧
          </button>
        </div>
      </div>
    );
  }

  if (step === 'audio') {
    // ✅ SAFETY CHECK (blank screen se bachane ke liye)
    if (!content.audioLectures || content.audioLectures.length === 0) {
      return (
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <StepIndicator />

          <h2 className="text-3xl font-black text-gray-800 mb-4">
            🎧 Audio Lectures
          </h2>

          <p className="text-gray-500 mb-10">
            Audio lectures are not available for this level.
          </p>

          <button
            onClick={() => setStep('practice')}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition"
          >
            Go to Skill Lab →
          </button>
        </div>
      );
    }

    const audioModule = content.audioLectures[currentAudioModule];
    const lecture = audioModule.lectures[currentAudioIdx];

    return (
      <div className="max-w-4xl mx-auto mt-6 px-4 py-12" style={{ marginTop: "5vw", borderRadius: "40px", boxShadow: "0 6px 18px rgba(255,255,255,0.8)", paddingLeft: "2vw", paddingRight: "2vw" }}>
        <StepIndicator />

        <div className="bg-white rounded-[3rem] shadow-2xl p-12 border text-center">
          <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">
            Module {currentAudioModule + 1} • Lecture {currentAudioIdx + 1} / {audioModule.lectures.length}
          </p>

          <h2 className="text-3xl font-black text-gray-900 mb-10">
            {lecture.title}
          </h2>

          <audio
            controls
            src={lecture.audioUrl}
            className="w-full mb-10"
            onEnded={() => {
              // ▶️ Next lecture
              if (currentAudioIdx < audioModule.lectures.length - 1) {
                setCurrentAudioIdx(v => v + 1);
              }
              // ▶️ Next module
              else if (currentAudioModule < content.audioLectures.length - 1) {
                setCurrentAudioModule(v => v + 1);
                setCurrentAudioIdx(0);
              }
              // ▶️ All done → Practice
              else {
                setStep('practice');
              }
            }}
          />

          <div className="flex justify-center gap-6">
            <button
              disabled={currentAudioIdx === 0 && currentAudioModule === 0}
              onClick={() => {
                if (currentAudioIdx > 0) {
                  setCurrentAudioIdx(v => v - 1);
                } else if (currentAudioModule > 0) {
                  const prevModule = currentAudioModule - 1;
                  setCurrentAudioModule(prevModule);
                  setCurrentAudioIdx(
                    content.audioLectures[prevModule].lectures.length - 1
                  );
                }
              }}
              className="px-10 py-4 border rounded-xl font-black text-gray-400 hover:text-gray-600 disabled:opacity-30"
              style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.8)", color: "black" }}
            >
              ◀ Prev
            </button>

            <button
              onClick={() => {
                if (currentAudioIdx < audioModule.lectures.length - 1) {
                  setCurrentAudioIdx(v => v + 1);
                } else if (currentAudioModule < content.audioLectures.length - 1) {
                  setCurrentAudioModule(v => v + 1);
                  setCurrentAudioIdx(0);
                } else {
                  setStep('practice');
                }
              }}
              className="px-12 py-4 bg-indigo-600 text-white rounded-xl font-black shadow hover:bg-indigo-700"
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>
    );
  }





  if (step === 'practice') {
    const question = content.practiceQuestions[currentQuestionIdx];
    const userAns = answers[question.id];

  // Fixed: Declare prompt keywords and matched keyword
  const promptKeywords = question.keywords
    ? (Array.isArray(question.keywords) ? question.keywords : question.keywords.split(','))
        .map(k => k.trim().toLowerCase()).filter(Boolean)
    : [];

  const matchedKeywords = promptKeywords.filter((keyword: string) =>
    String(userAns || '').toLowerCase().includes(keyword)
  ).length;

  const isCorrect = () => {
      if (question.type === "mcq" || question.type === "scenario") {
        return userAns === question.correctIndex;
      }

      if (question.type === "fill-in-the-blanks") {
        return (
          String(userAns || "")
            .trim()
            .toLowerCase() ===
          question.correctAnswer?.toLowerCase()
        );
      }

      if (question.type === "prompt-writing") {
        const keywords = question.correctAnswer?.split(",");
        return keywords?.some(k =>
          String(userAns || "")
            .toLowerCase()
            .includes(k.trim().toLowerCase())
        );
      }

      return false;
    };

    return (
      <div
        className="max-w-4xl mx-auto mt-6 px-4 py-12"
        style={{
          borderRadius: "40px",
          boxShadow: "0 6px 18px rgba(255,255,255,0.8)",
          paddingLeft: "2vw",
          paddingRight: "2vw"
        }}
      >
        <StepIndicator />

        <div className="bg-white rounded-[3rem] shadow-2xl p-12 border border-gray-100">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <span className="text-xs font-black bg-indigo-600 text-white px-5 py-2 rounded-full uppercase tracking-[0.2em]">
              Lab Session {currentQuestionIdx + 1}/10
            </span>

            <div className="w-full sm:w-48 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-700 ease-out"
                style={{
                  width: `${((currentQuestionIdx + 1) / 10) * 100}%`
                }}
              ></div>
            </div>
          </div>

          <h3 className="text-3xl font-black text-gray-800 mb-12 leading-[1.1]">
            {question.text}
          </h3>

          {/* MCQ / SCENARIO */}
          <div className="space-y-4">
            {(question.type === 'mcq' || question.type === 'scenario') && (
              <div className="grid gap-5">
                {question.options.map((opt, i) => {
                  const selected = userAns === i;
                  const correct = i === question.correctIndex;

                  return (
                    <button
                      key={i}
                      disabled={userAns !== undefined}
                      onClick={() => {
                        if (userAns === undefined) handleAnswer(i);
                      }}
                      className={`text-left p-8 rounded-[2rem] border-2 transition-all flex items-center justify-between gap-8
                      ${selected
                          ? correct
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-gray-50 hover:border-indigo-100 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-8">
                        <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl
                        ${selected
                            ? correct
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-400'
                          }`}>
                          {String.fromCharCode(65 + i)}
                        </span>

                        <span className="font-bold text-xl text-gray-700">
                          {opt}
                        </span>
                      </div>

                      {selected && (
                        <span className={`text-2xl font-bold
                        ${correct ? "text-green-600" : "text-red-600"}`}>
                          {correct ? "✔" : "✖"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* FILL IN THE BLANKS */}
            {question.type === 'fill-in-the-blanks' && (
             <input
  disabled={submitted}
  type="text"
  value={String(userAns || '')}
  onChange={e => handleAnswer(e.target.value)}
  placeholder="Type your answer here..."
  className={`w-full p-8 border-4 rounded-[2rem] text-2xl font-black 
  outline-none transition-all shadow-inner 
  bg-white text-black placeholder-grey placeholder-opacity-100
  ${userAns
      ? isCorrect()
        ? 'border-green-500'
        : 'border-red-500'
      : 'border-gray-300'
    }`}
/>
            )}

            {/* PROMPT WRITING */}
            {question.type === 'prompt-writing' && (
              <textarea
                disabled={submitted}
                value={String(userAns || '')}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Draft your optimized prompt here..."
                className={`w-full p-8 border-4 rounded-[2rem] text-2xl font-black 
  outline-none transition-all shadow-inner 
  bg-white text-black placeholder-grey placeholder-opacity-100
                ${userAns
                    ? isCorrect()
                      ? 'border-green-500 '
                      : 'border-red-500 '
                    : 'border-gray-50'
                  }`}
              ></textarea>
            )}
          </div>

         {/* CORRECT ANSWER DISPLAY */}
{(question.type === "mcq" || question.type === "scenario" || question.type === "fill-in-the-blanks"
  ? (question.type === "mcq" ? userAns !== undefined : submitted)
  : false) && (
  <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-green-50 border-2 border-black shadow-md">

    <p className="font-black mb-3 text-base sm:text-lg text-black uppercase tracking-wide">
      Correct Answer:
    </p>

    <p className="text-black text-lg sm:text-xl font-semibold break-words">
      {question.type === "mcq" || question.type === "scenario"
        ? question.options[question.correctIndex]
        : question.correctAnswer}
    </p>

  </div>
)}

    
   {/* ADDED: Prompt-writing feedback after submit */}
          {question.type === 'prompt-writing' && submitted && (
            <div className="mt-10 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-gray-50 border-2 border-black shadow-md">
                <p className="font-black mb-3 text-base sm:text-lg text-black uppercase tracking-wide">
                  Your Submitted Answer:
                </p>
                <p className="text-black text-lg sm:text-xl font-semibold whitespace-pre-wrap break-words">
                  {String(userAns || '')}
                </p>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-amber-50 border-2 border-black shadow-md">
                <p className="font-black mb-3 text-base sm:text-lg text-black uppercase tracking-wide">
                  Expected Keywords:
                </p>
                {promptKeywords.length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-3">
                      {promptKeywords.map((keyword, idx) => (
                        <span
                          key={`${question.id}-keyword-${idx}`}
                          className={`px-4 py-2 rounded-full text-sm sm:text-base font-bold border ${
                            matchedKeywords === promptKeywords.length || promptKeywords.filter(k => String(userAns || '').toLowerCase().includes(k)).length > 0
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : 'bg-white text-black border-gray-300'
                          }`}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-black text-base sm:text-lg font-semibold">
                      You matched {matchedKeywords} out of {promptKeywords.length} keywords
                    </p>
                  </>
                ) : (
                  <p className="text-black text-lg sm:text-xl font-semibold break-words">
                    No keywords provided for this question.
                  </p>
                )}
              </div>

            {/* MODEL ANSWER (SPLIT BY '.') */}
<div className="p-6 sm:p-8 rounded-3xl bg-green-50 border-2 border-black shadow-md">
  <p className="font-black mb-3 text-base sm:text-lg text-black uppercase tracking-wide">
    Model Answer:
  </p>

  <div className="space-y-4">
    {question.correctAnswer ? (
      String(question.correctAnswer)
        .split('.') // 🔥 split by dot
        .filter(sentence => sentence.trim() !== '')
        .map((sentence, idx) => (
          <p
            key={`${question.id}-model-${idx}`}
            className="text-black text-lg sm:text-xl font-semibold leading-relaxed break-words"
          >
            {sentence.trim()}.
          </p>
        ))
    ) : (
      <p className="text-black text-lg sm:text-xl font-semibold">
        No model answer provided.
      </p>
    )}
  </div>
</div>
            </div>
          )}



          {/* NAVIGATION */}
          <div className="mt-16 pt-10 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-8">
            {/* SUBMIT BUTTON */}
 {!submitted &&
              question.type !== "mcq" &&
              String(userAns || "").trim() !== "" && (
                <button
                  onClick={() => {
                    setSubmitted(true);
                    if (question.type === 'prompt-writing') {
                      computeKeywordsScore(question, userAns as string);
                    }
                  }}
                  className="px-12 py-5 bg-green-600 text-white rounded-2xl font-black shadow hover:bg-green-700"
                >
                  Submit Answer
                </button>
              )}


             <button
              disabled={currentQuestionIdx === 0}
              onClick={() => {
                setCurrentQuestionIdx(v => v - 1);
                setFeedback(null);
                setSubmitted(false);
              }}
              className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              Previous Task
            </button>

            <button
              /*onClick={nextQuestion}
              disabled={userAns === undefined}*/
              onClick={nextQuestion}
              disabled={
                question.type === "mcq"
                  ? userAns === undefined
                  : !submitted
              }
              className="w-full sm:w-auto px-16 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {currentQuestionIdx === content.practiceQuestions.length - 1
                ? 'Finish Skill Lab'
                : 'Next Task'}
            </button>
          </div>

        </div>
      </div>
    );
  }


  return null;
};

export default LearningModule;
