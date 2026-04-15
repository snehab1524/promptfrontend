import React, { useState, useEffect } from 'react';
import { LevelContent, LevelId, Question, UserProfile } from '../types';
import { useNavigate } from "react-router-dom";
interface Props {
  content: LevelContent;
  profile: UserProfile;
  activeLevelId: string;
  onComplete: (score: number) => void;
  onExitExam: () => void;

}

  const shuffleArray = (array: Question[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};


const FinalTest: React.FC<Props> = ({ content, onComplete, profile, activeLevelId, onExitExam }) => {
  const navigate = useNavigate();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [timeLeft, setTimeLeft] = useState(1200);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [examBlocked, setExamBlocked] = useState(false);
  const [fullname,setFullname]=useState("");
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);

  useEffect(() => {
        const storedeUser = localStorage.getItem('user');
        if (storedeUser) {
          const user = JSON.parse(storedeUser);
          setFullname(user.fullName);
          //setEmail(user.email);
        }
      }, []);



    

  //LOAD EXAM STATE AFTER REFRESH
  useEffect(() => {
    const saved = localStorage.getItem("examState");

    if (saved) {
      const data = JSON.parse(saved);

      if (data.activeLevelId === activeLevelId) {
        setAnswers(data.answers || {});
        setCurrentIdx(data.currentIdx || 0);
        //setTimeLeft(data.timeLeft || 1200);
         // restore same question set
      if (data.examQuestions) {
        setExamQuestions(data.examQuestions);
      }
        if (data.endTime) {
          const remaining = Math.floor((data.endTime - Date.now()) / 1000);
          setTimeLeft(remaining > 0 ? remaining : 0);
          setEndTime(data.endTime);
          return;
        }
      }
    }

     // NEW EXAM → RANDOM 20 QUESTIONS
  const randomized = shuffleArray(content.finalTestQuestions).slice(0, 20);
  setExamQuestions(randomized);   //change here

      // fresh exam → set end time now
      const newEnd = Date.now() + 1200 * 1000;
      setEndTime(newEnd);
  }, [activeLevelId,content.finalTestQuestions]);


  //SAVE EXAM STATE CONTINUOUSLY
  useEffect(() => {
    if (!isFinished && endTime) {
      localStorage.setItem(
        "examState",
        JSON.stringify({
          answers,
          currentIdx,
          endTime,  
          activeLevelId,
          examQuestions,
        })
      );
    }
  }, [answers, currentIdx, endTime, activeLevelId, isFinished, examQuestions]);





  // TIMER
  useEffect(() => {
    if (isFinished || !endTime) return;

    const timer = setInterval(() => {
      const remaining = Math.floor((endTime - Date.now()) / 1000);

      /*setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();   // auto submit safely
          return 0;
        }
        return prev - 1;
      });*/

      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        handleSubmit();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime,isFinished]);



  //tab switch minimize like cheating detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;

          if (newCount >= 3) {
            setExamBlocked(true);
            setIsFinished(true);
            localStorage.setItem("examBlocked", "true"); // persist block
            localStorage.removeItem("examState");
          } else {
            alert(`Warning: You switched tab ${newCount}/3 times.`);
          }

          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isFinished]);


  //exam block persist
  useEffect(() => {
    const blocked = localStorage.getItem("examBlocked");
    if (blocked === "true") {
      setExamBlocked(true);
      setIsFinished(true);
    }
  }, []);



  //REFRESH WARNING
  useEffect(() => {
    const warnUser = (e: any) => {
      if (!isFinished) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", warnUser);
    return () => window.removeEventListener("beforeunload", warnUser);
  }, [isFinished]);




  //VALIDATE ANSWERS
  const validateAnswer = (q: Question, ans: number | string | undefined): boolean => {
    if (ans === undefined || ans === '') return false;

    if (q.type === 'mcq' || q.type === 'scenario') {
      return ans === q.correctIndex;
    }

    const userStr = String(ans).toLowerCase().trim();

    if (q.type === 'fill-in-the-blanks') {
      const correctStr = (q.correctAnswer || '').toLowerCase().trim();
      return userStr.includes(correctStr);
    }

    if (q.type === 'prompt-writing') {
      if (userStr.length < 10) return false;
      const keywords = (q.correctAnswer || '').toLowerCase().split(',');
      return keywords.some(kw => userStr.includes(kw.trim()));
    }

    return false;
  };




  //submit exam
  const handleSubmit = () => {
    if (!window.confirm("Are you sure to submit?")) return;
    let correct = 0;
    /*content.finalTestQuestions.forEach((q) => {
      if (validateAnswer(q, answers[q.id])) {
        correct++;
      }
    });*/

    examQuestions.forEach((q) => {
      if (validateAnswer(q, answers[q.id])) correct++;
    });


    //const score = correct / content.finalTestQuestions.length;
    const score = correct / examQuestions.length;
    setFinalScore(score);
    setIsFinished(true);
    localStorage.removeItem("examState"); // clear exam data
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  //const currentQuestion = content.finalTestQuestions[currentIdx];
  //const currentQuestion = examQuestions[currentIdx];



  if (examQuestions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 text-lg font-bold">
        Loading Final Skill Lab...
      </div>
    );
  }

  const currentQuestion = examQuestions[currentIdx];
  if (!currentQuestion) return null;






  if (isFinished) {
    const passed = finalScore >= 0.4;
    if (examBlocked) {
      return (
        <div className="max-w-2xl mx-auto py-20 px-4">
          <div className="bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100">
            <h2 className="text-3xl font-black text-red-600 mb-6">
              Exam Stopped ⚠️
            </h2>

            <p className="text-gray-600 text-lg mb-8">
              You switched tabs multiple times.
              This is not good practice during an exam.
            </p>

            <button
              onClick={() => {
                localStorage.removeItem("examBlocked");
                localStorage.removeItem("examState");
                onExitExam();     // go dashboard root
              }}
              className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black"
            >
              Retake Exam
            </button>
          </div>
        </div>
      );
    }

    return (

      <div className="max-w-2xl mx-auto py-20 px-4">
        <div className="bg-white rounded-[3rem] shadow-2xl p-12 text-center border border-gray-100">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {passed ? (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </div>

          <h2 className="text-4xl font-black mb-4">
            {passed ? 'Congratulations!' : 'Not Quite There'}
          </h2>

          <p className="text-gray-500 mb-8 text-lg">
            You scored <span className="font-black text-gray-900">
              {Math.round(finalScore * 100)}%
            </span> in the professional assessment.
            {passed
              ? ' Your expertise is verified.'
              : ' You need at least 40% to qualify for certification.'}
          </p>

          <div className="space-y-4">
            {passed ? (
              <button
                onClick={() => {
                  const certId = "CERT-" + Date.now();
                  const learnerName = profile?.fullName || fullname || "Student";

                  // Persist the resolved learner name for the certificate screen.
                  localStorage.setItem("certUserName", learnerName);



                  navigate("/verify", {
                    state: {
                      certId,
                      course: content.name,
                      levelId: activeLevelId
                    }
                  });
                }}   // certificate trigger ONLY if passed
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
              >
                Generate My Certificate
              </button>
            ) : (
              <button
                onClick={() => {

                  localStorage.removeItem("examState");   // ADD THIS
                  localStorage.removeItem("examBlocked");
                  onExitExam();   // go dashboard root
                }}// retake safely
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-gray-800 transition-all"
              >
                Review & Retake
              </button>
            )}
          </div>
        </div>
      </div >
    );
  }

  return (
  <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4">
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-300 overflow-hidden relative">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Certification Exam
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">
              Secured Assessment Session
            </p>
          </div>
        </div>

        <div className="bg-black text-white px-6 sm:px-8 py-4 rounded-2xl text-center shadow-md">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">
            Time Remaining
          </p>
          <p className="text-2xl sm:text-3xl font-mono font-black">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* QUESTION AREA */}
      <div className="mb-10 min-h-[350px]">

        {/* QUESTION HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <span className="bg-black text-white px-4 py-1 rounded-lg text-xs sm:text-sm font-bold uppercase">
            Question {currentIdx + 1} / {examQuestions.length}
          </span>

          <div className="flex-grow h-2 bg-gray-300 rounded-full">
            <div
              className="h-full bg-black rounded-full transition-all duration-500"
              style={{
                width: `${((currentIdx + 1) / examQuestions.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* QUESTION TEXT */}
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-black bg-gray-200 px-3 py-1 rounded-full mb-3 inline-block">
            {currentQuestion.type.replace("-", " ")}
          </span>

          <p className="text-xl sm:text-2xl font-bold text-black leading-snug">
            {currentQuestion.text}
          </p>
        </div>

        {/* ANSWERS */}
        <div className="mt-6">

          {/* MCQ / SCENARIO */}
          {(currentQuestion.type === "mcq" ||
            currentQuestion.type === "scenario") && (
            <div className="grid gap-4">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setAnswers({ ...answers, [currentQuestion.id]: i })
                  }
                  className={`w-full text-left p-4 sm:p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    answers[currentQuestion.id] === i
                      ? "border-black bg-gray-200 shadow-inner"
                      : "border-gray-300 bg-white hover:border-black"
                  }`}
                >
                  <span
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold ${
                      answers[currentQuestion.id] === i
                        ? "bg-black text-white"
                        : "bg-gray-100 border border-gray-300 text-black"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>

                  <span className="font-semibold text-base sm:text-lg text-black">
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* FILL IN BLANK */}
          {currentQuestion.type === "fill-in-the-blanks" && (
            <input
              type="text"
              className="w-full p-4 sm:p-6 border-2 border-gray-400 rounded-2xl text-lg sm:text-xl font-semibold text-black bg-white outline-none focus:border-black focus:ring-2 focus:ring-gray-400 transition-all"
              placeholder="Type your answer..."
              value={String(answers[currentQuestion.id] || "")}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [currentQuestion.id]: e.target.value
                })
              }
            />
          )}

          {/* PROMPT WRITING */}
          {currentQuestion.type === "prompt-writing" && (
            <textarea
              className="w-full p-6 border-2 border-gray-400 rounded-3xl text-base sm:text-lg font-medium text-black bg-white outline-none focus:border-black focus:ring-2 focus:ring-gray-400 transition-all min-h-[180px]"
              placeholder="Draft your optimized prompt here..."
              value={String(answers[currentQuestion.id] || "")}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [currentQuestion.id]: e.target.value
                })
              }
            />
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col lg:flex-row justify-between items-center pt-6 border-t border-gray-200 gap-6">

        {/* QUESTION NAV */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 overflow-x-auto pb-2 w-full lg:w-auto">
          {examQuestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-8 h-8 rounded-md font-bold text-xs transition-all border ${
                idx === currentIdx
                  ? "bg-black border-black text-white scale-110"
                  : answers[examQuestions[idx].id] !== undefined &&
                    answers[examQuestions[idx].id] !== ""
                  ? "bg-gray-300 border-gray-400 text-black"
                  : "bg-white border-gray-300 text-black"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="flex gap-4 w-full lg:w-auto">
          {currentIdx > 0 && (
            <button
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="flex-1 lg:flex-none px-6 py-3 text-black font-bold border border-gray-300 hover:bg-gray-200 rounded-2xl transition"
            >
              Back
            </button>
          )}

          {currentIdx < examQuestions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx(currentIdx + 1)}
              className="flex-1 lg:flex-none px-8 py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition active:scale-95"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 lg:flex-none px-8 py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition active:scale-95"
            >
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default FinalTest;
