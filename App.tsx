import React, { useState, useEffect } from 'react';
import { AppState, UserProfile, UserProgress, LevelId, DomainId } from './types';
import { COURSE_CONTENT, PASSING_CRITERIA } from './constants';
import RegistrationForm from './components/RegistrationForm';
import Dashboard from './components/Dashboard';
import LearningModule from './components/LearningModule';
import AadhaarVerification from './components/AadhaarVerification';
import Certificate from './components/Certificate';
import Certificates from './components/Certificates';
import FinalTest from './components/FinalTest';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Admin from './components/Admin';
import AdminRoute from './components/AdminRoute';
import "./components/dashbord.css"
import axios from 'axios';
import VerifyCertificate from './components/VerifyCertificate';
import { FaPowerOff } from 'react-icons/fa';
import Userlogin from './components/Userlogin';
import Register from './components/Register';
import Landing from './components/Landing';
import Protectedroute from './components/Protectedroute';
import logo from './components/assets/logo2.png';
import { API_BASE_URL } from './api';

type SavedPromptMasterData = {
  profile: UserProfile | null;
  progress: UserProgress;
  courseName?: string;
  payment_verified?: string;
};

type LoginSuccessData = {
  user: UserProfile;
  progress?: UserProgress;
  courseName?: string;
  payment_verified?: string;
};

type StoredUserData = {
  email?: string;
  fullName?: string;
};

type CertificationRecord = UserProgress["certifications"][number];
type CourseContentKey = keyof typeof COURSE_CONTENT;

const EMPTY_USER_PROFILE: UserProfile = {
  fullName: "",
  email: "",
  phone: "",
  citizen: "",
  paymentVerified: "NO Payment",
  courseexpairy: ""
};





const App: React.FC = () => {

  const navigate = useNavigate();

  const getPromptMasterStorageKey = (): string | null => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      const user: StoredUserData = JSON.parse(userStr);
      if (!user?.email) return null;
      const emailKey = user.email.replace(/[@.]/g, '_');
      return `prompt_master_data_${emailKey}`;
    } catch {
      return null;
    }
  };

  const getSavedPromptMasterData = (): SavedPromptMasterData => {
    try {
      let saved = null;

      const promptMasterKey = getPromptMasterStorageKey();
      if (promptMasterKey) {
        saved = localStorage.getItem(promptMasterKey);
      }
      
      // Fall back to global key if email-specific key not found
      if (!saved) {
        saved = localStorage.getItem('prompt_master_data');
      }
      
      if (!saved) {
        return {
          profile: null,
          progress: {
            completedLevels: [],
            currentLevelId: LevelId.BEGINNER,
            certifications: []
          },
          courseName: undefined,
          payment_verified: undefined
        };
      }

      const parsed: Partial<SavedPromptMasterData> = JSON.parse(saved);
      return {
        profile: parsed.profile || null,
        progress: parsed.progress || {
          completedLevels: [],
          currentLevelId: LevelId.BEGINNER,
          certifications: []
        },
        courseName: parsed.courseName,
        payment_verified: parsed.payment_verified
      };
    } catch (err) {
      console.error('Failed to parse prompt_master_data', err);
      return {
        profile: null,
        progress: {
          completedLevels: [],
          currentLevelId: LevelId.BEGINNER,
          certifications: []
        },
        courseName: undefined,
        payment_verified: undefined
      };
    }
  };

  const logoutto = () => {
    localStorage.removeItem('token');
    // Don't clear progress - keep completed courses persistent
    setUserProfile(null);
    setAppState('registration');
    navigate('/login');
  };

  const loadPromptMasterData = () => {
    const promptMasterKey = getPromptMasterStorageKey();
    const saved = (promptMasterKey && localStorage.getItem(promptMasterKey)) || localStorage.getItem('prompt_master_data');
    if (!saved) return;

    try {
      const data: Partial<SavedPromptMasterData> = JSON.parse(saved);
      if (data.profile) {
        setUserProfile(data.profile);
        setFullname(data.profile.fullName || '');
        setEmail(data.profile.email || '');
      }
      if (data.progress) {
        setUserProgress(data.progress);
      }
      if (data.courseName && data.payment_verified === 'Payment Done') {
        setAppState('dashboard');
      }
    } catch (err) {
      console.error('Failed to load prompt_master_data', err);
    }
  };

const handleLoginSuccess = (loginData: LoginSuccessData) => {
    // Skip if admin login (handled separately in Userlogin.jsx)
    if (localStorage.getItem('isAdmin') === 'true') {
      return;
    }

    const profile = loginData.user;
    const progress = loginData.progress || {
      completedLevels: [],
      currentLevelId: LevelId.BEGINNER,
      certifications: []
    };

    setUserProfile(profile);
    setUserProgress(progress);
    setFullname(profile.fullName || '');
    setEmail(profile.email || '');

    if (loginData.courseName && loginData.payment_verified === 'Payment Done') {
      setAppState('dashboard');
    } else {
      setAppState('registration');
    }
  };

  const savedData = getSavedPromptMasterData();

  const [appState, setAppState] = useState<AppState>(savedData.courseName && savedData.payment_verified === 'Payment Done' ? 'dashboard' : 'registration');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(savedData.profile);
  const [userProgress, setUserProgress] = useState<UserProgress>(savedData.progress);
  const [activeLevelId, setActiveLevelId] = useState<string>(LevelId.BEGINNER);
  const [, setTestScore] = useState<number | null>(null);
  const [expairy, setExpairy] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [remainingTime, setRemainingTime] = useState("");
  const [fullname, setFullname] = useState(savedData.profile?.fullName || "");
  const [email, setEmail] = useState(savedData.profile?.email || "");






  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user: StoredUserData = JSON.parse(storedUser);

      setFullname(user.fullName || "");
      setEmail(user.email || "");
    }
  }, []);



  // fetch expiry date from backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/my-course-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.status === 200 && response.data.courseexpairy) {
          setExpairy(response.data.courseexpairy);
          setDate(new Date(response.data.courseexpairy).toLocaleDateString('en-GB'));
        }
      } catch (err: any) {
        if (err.response?.status !== 500) {
          console.warn('Expiry fetch failed:', err.message);
        }
        // Silent fallback on 500 - expiry shows empty/"Loading..."
      }
    };

    fetchStatus();
  }, []);


  // countdown timer
  useEffect(() => {
    if (!expairy) return;
    const timer = setInterval(() => {
      const diff = new Date(expairy).getTime() - Date.now();

      if (diff <= 0) {
        setRemainingTime("Expired");
        clearInterval(timer);
        logout();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setRemainingTime(`${days}d ${hours}h ${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [expairy]);



  //const expairy = userProfile?.courseexpairy;
  //auto logout function after certain duration
  const logout = () => {
    localStorage.removeItem('token');
    setUserProfile(null);
    setUserProgress({
      completedLevels: [],
      currentLevelId: LevelId.BEGINNER,
      certifications: []
    });
    setAppState('registration');
    navigate('/course');
  };



  const dash = () => {
    if (appState === "final-test") {
      alert("You cannot leave during the final exam.");
      return;
    }
    setAppState("dashboard");
  };






  // --- Load user and progress safely on mount ---
// ALWAYS LOAD LATEST USER + PROGRESS FROM BACKEND
/*const loadUserAndProgress = async () => {
  try {
    const saved = localStorage.getItem("prompt_master_data");
    if (!saved) return;

    const { profile } = JSON.parse(saved);
    if (!profile?.email) return;
    setUserProfile(profile);

    // 1️⃣ Get fresh progress from backend
    const res = await fetch(`${API_BASE_URL}/get-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email:profile.email })
    });

    const data = await res.json();

    if (data.progress) {
      setUserProgress(data.progress);

      // 2️⃣ Sync localStorage
      localStorage.setItem(
        "prompt_master_data",
        JSON.stringify({
          profile,
          progress: data.progress
        })
      );
    }

  } catch (err) {
    console.error("Dashboard refresh failed:", err);
  }
};

// ✅ REFRESH PROGRESS EVERY TIME DASHBOARD OPENS
useEffect(() => {
  if (appState === "dashboard") {
    loadUserAndProgress();
  }
}, [appState]);*/



useEffect(() => {
  loadPromptMasterData();
}, []);



  // --- 2️⃣ Save progress safely ---
/*const saveState = async (profile: UserProfile, progress: UserProgress) => {
  if (!profile) return;
  try {
    await fetch(`${API_BASE_URL}/save-progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profile.email,
        progress,
      }),
    });

    localStorage.setItem(
      "prompt_master_data",
      JSON.stringify({ profile, progress })
    );
  } catch (err) {
    console.error("Save failed:", err);
  }
};*/

const saveState = async (profile: UserProfile, progress: UserProgress) => {
  try {
    if (!profile?.email) return;

    const data = {
      profile,
      progress
    };

    // Use email-specific key for consistency
    const emailKey = profile.email.replace(/[@.]/g, '_');
    const promptMasterKey = `prompt_master_data_${emailKey}`;
    
    localStorage.setItem(promptMasterKey, JSON.stringify(data));

    // Also save to global key for backward compatibility
    localStorage.setItem("prompt_master_data", JSON.stringify(data));

    // Backend sync
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}/save-progress`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            currentLevelId: progress.currentLevelId,
            completedLevels: progress.completedLevels,
            certifications: progress.certifications
          }),
        });
        if (!response.ok) {
          console.error("Backend response error:", response.status, response.statusText);
          const errorText = await response.text();
          console.error("Error response body:", errorText);
        } else {
          await response.json();
        }
      } catch (fetchErr) {
        console.error("Fetch error:", fetchErr);
      }
    }
  } catch (err) {
    console.error("Save failed:", err);
  }
};




  //start level fuction
  const startLevel = (id: string) => {
    setActiveLevelId(id);
    setAppState('learning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  //finish learning
  const finishLearning = () => {
    setAppState('aadhaar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  //finish verification function
  const finishVerification = () => {
    setAppState('final-test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  //finish test function
  const finishTest = (score: number) => {
    setTestScore(score);
    if (score >= PASSING_CRITERIA) {
      setAppState('certificate');
    } else {
      // Logic for failing is handled inside FinalTest result screen now, 
      // but we keep this as a fallback.
      setAppState('learning');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };




  /*  NEW: Update progress when certificate verified from Verify page */

   const completeFromVerify = async (
    levelId?: string,
    levelName?: string
  ) => {
    if (!userProfile) return;

  if (!levelId) {
      setAppState('dashboard');
      navigate('/course');
      return;
    }

    const resolvedLevelName = levelName || getCourseContentById(levelId)?.name || levelId;

    const completedLevels = userProgress.completedLevels.includes(levelId)
      ? userProgress.completedLevels
      : [...userProgress.completedLevels, levelId];

    const certifications = [...userProgress.certifications];

    if (!certifications.find((c) => c.levelName === resolvedLevelName)) {
      const newCertId = getCertIdForLevel(levelId, userProfile?.email || "", certifications);
      certifications.push({
        id: newCertId,
        levelName: resolvedLevelName,
        date: new Date().toLocaleDateString(),
        learnerName: userProfile.fullName,
      });
    }

    const updatedProgress = {
      ...userProgress,
      completedLevels,
      certifications,
    };

    setUserProgress(updatedProgress);
    await saveState(userProfile, updatedProgress);

    // Unlock next level after completion
    unlockNext(levelId, updatedProgress);

    setAppState("dashboard");
    navigate("/course");
  };



 



// --- Helper function to generate deterministic cert ID ---
const generateCertId = (levelId: string, email: string): string => {
  // Create a simple hash from levelId and email
  const str = `${levelId}-${email}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to positive hex and take first 6 chars
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `PM-${levelId.toUpperCase()}-${hex.substring(0, 6).toUpperCase()}`;
};

const getCourseContentById = (levelId: string) => COURSE_CONTENT[levelId as CourseContentKey];

// Get existing cert ID or generate new deterministic one
const getCertIdForLevel = (levelId: string, email: string, existingCerts: CertificationRecord[]): string => {
  // Check if certificate already exists for this level
  const existingCert = existingCerts.find(c => c.levelName === getCourseContentById(levelId)?.name);
  if (existingCert && existingCert.id) {
    return existingCert.id;
  }
  // Generate new deterministic ID
  return generateCertId(levelId, email);
};

const effectiveUserProfile = userProfile || EMPTY_USER_PROFILE;
const activeLevelContent = getCourseContentById(activeLevelId);


// --- 4️⃣ Unlock Next Level (fully fixed) ---
const unlockNext = (levelId: string, progress?: UserProgress) => {
  if (!userProfile) return;

  setUserProgress((prev) => {
    const baseProgress = progress || prev;

    const levelInfo = getCourseContentById(levelId);
    if (!levelInfo) return baseProgress;

    // Mark level complete
    const completedLevels = baseProgress.completedLevels.includes(levelId)
      ? [...baseProgress.completedLevels]
      : [...baseProgress.completedLevels, levelId];

    // Add certificate if missing - use deterministic ID
    const certifications = [...baseProgress.certifications];
    if (!certifications.find((c) => c.levelName === levelInfo.name)) {
      const newCertId = getCertIdForLevel(levelId, userProfile?.email || "", certifications);
      certifications.push({
        id: newCertId,
        levelName: levelInfo.name,
        date: new Date().toLocaleDateString(),
        learnerName: userProfile.fullName || "Student",
      });
    }

    let nextLevel = baseProgress.currentLevelId;

    // Beginner → Domain
    if (levelId === LevelId.BEGINNER) {
      nextLevel = LevelId.DOMAIN_SPECIFIC;
    }

    // Domain → Advanced
    const domains = [
      DomainId.CONTENT_WRITING,
      DomainId.MARKETING,
      DomainId.CODING,
      DomainId.DATA_ANALYSIS,
      DomainId.EDUCATION,
      DomainId.BUSINESS,
      DomainId.FASHION,
      DomainId.HEALTH,
    ];

    if (domains.includes(levelId as DomainId)) {
      nextLevel = LevelId.ADVANCED;

      if (!completedLevels.includes(LevelId.DOMAIN_SPECIFIC)) {
        completedLevels.push(LevelId.DOMAIN_SPECIFIC);
      }

      const masteryCert = "Domain Specific Mastery (Level 2)";
      if (!certifications.find((c) => c.levelName === masteryCert)) {
        const masteryCertId = getCertIdForLevel("domain-mastery", userProfile?.email || "", certifications);
        certifications.push({
          id: masteryCertId,
          levelName: masteryCert,
          date: new Date().toLocaleDateString(),
          learnerName: userProfile.fullName || "Student",
        });
      }
    }

    const updatedProgress: UserProgress = {
      ...baseProgress,
      completedLevels,
      certifications,
      currentLevelId: nextLevel,
    };

    saveState(userProfile, updatedProgress);

    // ✅ After unlock, ensure dashboard is active
    setAppState("dashboard");

    return updatedProgress;
  });
};






  const downloadCertificateFromHistory = (certId: string) => {
    const cert = userProgress.certifications.find(c => c.id === certId);
    if (cert) {
      // Find matching level content
      const foundId = Object.keys(COURSE_CONTENT).find(k => getCourseContentById(k)?.name === cert.levelName) || activeLevelId;
      setActiveLevelId(foundId);
      setAppState('certificate');
    }
  };

  return (


    <Routes>
      <Route path='/' element={<Landing />} />
      <Route element={<Protectedroute />}>
        <Route
  path="/course"
  element={
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-white">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#111] border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-wrap gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer">
            <img 
              src={logo} 
              alt="AIINSIGHT Logo" 
              style={{ height: "70px", width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* RIGHT SIDE */}
          {appState !== "registration" && (
            <div className="flex flex-wrap items-center gap-4">

              {/* Expiry + Timer */}
              <div className="flex flex-col sm:flex-row gap-2 text-xs sm:text-sm">
                <div className="bg-[#1c1c1c] px-4 py-2 rounded-lg border border-gray-700">
                  Expiry: {date || "Loading..."}
                </div>
                <div className="bg-[#1c1c1c] px-4 py-2 rounded-lg border border-gray-700">
                  Remaining: {remainingTime}
                </div>
              </div>

              {/* User */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] uppercase text-gray-500">
                  Verified User
                </span>
                <span className="text-sm font-semibold">
                  {fullname}
                </span>
              </div>

              {/* Buttons */}
              <button
                onClick={dash}
                className="px-5 py-2 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition"
              >
                Dashboard
              </button>

              <button
                onClick={() => setAppState("registration")}
                className="px-5 py-2 rounded-lg bg-gray-800 border border-gray-600 hover:bg-gray-700 transition"
              >
                Course
              </button>

              <button
                onClick={logoutto}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
              >
                <FaPowerOff />
              </button>

            </div>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-10">

        {appState === 'registration' && (
          <RegistrationForm
            ondash={() => setAppState("dashboard")}
            onComplete={(user: UserProfile) => {
              setUserProfile(user);
              saveState(user, userProgress);
              // Redirect to dashboard after successful payment
              setAppState("dashboard");
            }}
            profile={userProfile}
          />
        )}

        {appState === 'dashboard' && (
          <Dashboard
            key={`dashboard-${userProgress.completedLevels.length}-${userProgress.currentLevelId}`}
            profile={effectiveUserProfile}
            progress={userProgress}
            onStartLevel={startLevel}
            onDownloadCertificate={downloadCertificateFromHistory}
            onProgressUpdate={setUserProgress}
            onComplete={(updatedProfile) => {
              setUserProfile(updatedProfile);
              saveState(updatedProfile, userProgress);
            }}
          />
        )}

        {appState === 'learning' && (
          <LearningModule
            content={activeLevelContent!}
            onComplete={finishLearning}
          />
        )}

        {appState === 'aadhaar' && (
          <AadhaarVerification onVerified={finishVerification} />
        )}

        {appState === 'final-test' && (
          <FinalTest
            content={activeLevelContent!}
            profile={effectiveUserProfile}
            activeLevelId={activeLevelId}
            onComplete={finishTest}
            onExitExam={() => setAppState("dashboard")}
          />
        )}

        {appState === 'certificate' && (
          <Certificate
            learnerName={userProfile?.fullName || "Student"}
            courseLevel={activeLevelContent?.name || "Prompt Engineering"}
            certId={getCertIdForLevel(activeLevelId, userProfile?.email || "", userProgress.certifications)}
            date={new Date().toLocaleDateString()}
            onContinue={() => unlockNext(activeLevelId, userProgress)}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-xs uppercase tracking-widest">
        <p>© 2024 AIINSIGHT • Secure Learning Portal</p>
        <p className="mt-2 text-gray-600">
          Identity Verification Powered by DigiLocker Framework
        </p>
      </footer>

    </div>
  }
/>

      <Route
        path="/verify"
        element={
          <VerifyCertificate
            onCompleteLevel={completeFromVerify}
          
          />
        }
      />
      <Route path="/certificates" element={
        <Certificates 
          progress={userProgress}
          profile={effectiveUserProfile}
        />
      } />
      </Route>
      
      <Route path='/login' element={<Userlogin onLoginSuccess={handleLoginSuccess} />} />
      <Route path='/register' element={<Register />} />
<Route path='/admin' element={<AdminRoute />} />
      {/*<Route
        path="/dashboard"
        element={
          userProfile ? (
            <Dashboard
              profile={userProfile}
              progress={userProgress}
              onStartLevel={startLevel}
              onDownloadCertificate={downloadCertificateFromHistory}
              onProgressUpdate={setUserProgress}
              onComplete={(updatedProfile) => {
                setUserProfile(updatedProfile);
                saveState(updatedProfile, userProgress);
              }}
            />
          ) : (
            <RegistrationForm onComplete={handleRegistration} />
          )
        }
      />*/}

    </Routes>

  );


};

export default App;
