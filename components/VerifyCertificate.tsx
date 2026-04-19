import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Certificate from './Certificate';
import html2pdf from 'html2pdf.js';
import { UserProfile } from '../types';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import CertificatePDF from './CertificatePDF';
import { COURSE_CONTENT } from '../constants';
import { API_BASE_URL } from '../api';

/*interface Props {
  profile: UserProfile;
}*/

interface Props {
  onCompleteLevel?: (levelId: string, levelName: string) => void;
}

type CourseContentKey = keyof typeof COURSE_CONTENT;

const VerifyCertificate: React.FC<Props> = ({ onCompleteLevel }) => {


  /*const [fullname,setFullname]=useState("");
  const [email,setEmail]=useState("");*/

  const navigate = useNavigate();
  const storedName = localStorage.getItem("certUserName");
  const [params] = useSearchParams();
  const location = useLocation();
  //const { certId, course, profile } = location.state || {};
  const locationState = location.state || {};
  const certId = locationState.certId || params.get("certId") || "UNKNOWN";

  const getEmailKey = (key: string): string => {
    const userStr = localStorage.getItem("user");
    const email = userStr ? JSON.parse(userStr).email : 'default';
    return `${key}_${email.replace(/[@.]/g, '_')}`;
  };

  const getStoredPromptMasterData = () => {
    try {
      const userStr = localStorage.getItem("user");
      let saved = null;
      
      if (userStr) {
        const user = JSON.parse(userStr);
        const emailKey = user.email?.replace(/[@.]/g, '_');
        const promptMasterKey = `prompt_master_data_${emailKey}`;
        saved = localStorage.getItem(promptMasterKey);
      }
      
      if (!saved) {
        saved = localStorage.getItem("prompt_master_data");
      }
      
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("Failed to read stored progress", err);
      return null;
    }
  };

  const getStoredProgressData = () => {
    try {
      const emailPromptData = getStoredPromptMasterData();
      const emailProgress = localStorage.getItem(getEmailKey("userProgress"));
      const genericProgress = localStorage.getItem("UserProgress");

      const parsedEmailProgress = emailProgress ? JSON.parse(emailProgress) : null;
      const parsedGenericProgress = genericProgress ? JSON.parse(genericProgress) : null;

      return (
        emailPromptData ||
        (parsedEmailProgress ? { progress: parsedEmailProgress } : null) ||
        parsedGenericProgress ||
        null
      );
    } catch (err) {
      console.error("Failed to read stored user progress", err);
      return getStoredPromptMasterData();
    }
  };

  const getStoredCert = (id: string) => {
    const data = getStoredProgressData();
    const certifications: any[] = data?.progress?.certifications || [];
    return certifications.find((cert: any) => cert.certId === id || cert.id === id) || null;
  };

  const getCourseContentById = (id: string) => COURSE_CONTENT[id as CourseContentKey];

  const storedCert = certId !== "UNKNOWN" ? getStoredCert(certId) : null;
  const profileFullName = getStoredPromptMasterData()?.profile?.fullName;
  const certLabelMap: Record<string, string> = {
    "beginner": "Beginner Prompting",
    "content-writing": "Content Writing Domain",
    "marketing": "Marketing Prompt Crafting",
    "coding": "Coding Prompt Engineering",
    "data-analysis": "Data Analysis Prompting",
    "education": "Education Domain Mastery",
    "business": "Business Prompt Strategy",
    "fashion": "Fashion Industry Prompts",
    "health": "Healthcare Prompt Expertise",
    "advanced-content-writing": "Advanced Content Writing",
    "advanced-marketing": "Advanced Marketing Prompts",
    "advanced-coding": "Advanced Coding Prompts",
    "advanced-data-analysis": "Advanced Data Analysis",
    "advanced-education": "Advanced Education",
    "advanced-business": "Advanced Business",
    "advanced-fashion": "Advanced Fashion",
    "advanced-health": "Advanced Health"
  };

  const humanizeLevelKey = (value: string | null | undefined) => {
    if (!value || typeof value !== "string") return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    if (certLabelMap[trimmed]) {
      return certLabelMap[trimmed];
    }

    const normalized = trimmed.toLowerCase();
    if (certLabelMap[normalized]) {
      return certLabelMap[normalized];
    }

    if (normalized.startsWith("advanced-")) {
      const baseName = normalized
        .replace(/^advanced-/, "")
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
      return `Advanced ${baseName}`;
    }

    if (/^[a-z]+(?:-[a-z]+)+$/i.test(trimmed)) {
      return trimmed
        .split("-")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    }

    return trimmed;
  };

  const getLevelIdFromCertId = (value: string | null) => {
    if (!value || typeof value !== "string") return null;

    const upperValue = value.toUpperCase();
    if (!upperValue.startsWith("PM-")) return null;

    const knownLevelIds = Object.keys(certLabelMap).sort((a, b) => b.length - a.length);
    const normalizedLevelId = value
      .slice(3)
      .replace(/-[A-F0-9]{6,8}$/i, '')
      .toLowerCase();

    return knownLevelIds.find((knownId) => knownId === normalizedLevelId) || null;
  };

  const levelId =
    locationState.levelId ||
    getLevelIdFromCertId(certId) ||
    getLevelIdFromCertId(storedCert?.id) ||
    storedCert?.levelId ||
    (storedCert?.id && certLabelMap[storedCert.id] ? storedCert.id : null);

  const courseCandidates = [
    storedCert?.levelName,
    locationState.course,
    params.get("course"),
    locationState.courseName,
    levelId ? certLabelMap[levelId] : null,
    levelId ? getCourseContentById(levelId)?.name : null,
    levelId
  ];

  const resolvedCourse = courseCandidates.find((value) => {
    const normalizedValue = humanizeLevelKey(value);
    if (!normalizedValue) return false;
    return normalizedValue.trim().toLowerCase() !== "certificate";
  });

  const completedCourseName = (humanizeLevelKey(resolvedCourse) || "Completed Course")
    .replace(/\s+Certificate$/i, '')
    .trim();

  const resolveLearnerName = () => {
    const candidates = [
      storedCert?.learnerName,
      locationState.learnerName,
      profileFullName,
      storedName
    ];

    return candidates.find((value) => {
      if (typeof value !== "string") return false;
      const normalized = value.trim();
      if (!normalized) return false;

      const lowered = normalized.toLowerCase();
      return lowered !== "student" && lowered !== "studenr" && lowered !== "learner";
    }) || "Student";
  };

  const resolvedLearnerName = resolveLearnerName();

  const today = new Date();

  const formattedDate =
    String(today.getDate()).padStart(2, "0") + " " +
    String(today.getMonth() + 1).padStart(2, "0") + " " +
    today.getFullYear();

  const teleport = async () => {
    if (!levelId) return;

    localStorage.removeItem("examState");
    localStorage.removeItem("examBlocked");

    sessionStorage.removeItem("examState");

    const token = localStorage.getItem("token");

    // Get user-specific stored progress
    const storedProgress = getStoredPromptMasterData() || {
      profile: {},
      progress: {
        currentLevelId: "",
        completedLevels: [],
        certifications: []
      }
    };

    storedProgress.profile = storedProgress.profile || {};
    storedProgress.progress = storedProgress.progress || {
      currentLevelId: "",
      completedLevels: [],
      certifications: []
    };

    const progress = {
      currentLevelId: storedProgress.progress.currentLevelId || "",
      completedLevels: Array.isArray(storedProgress.progress.completedLevels)
        ? storedProgress.progress.completedLevels
        : [],
      certifications: Array.isArray(storedProgress.progress.certifications)
        ? storedProgress.progress.certifications
        : []
    };

    const updatedCompleted = Array.from(
      new Set([...(progress.completedLevels || []), levelId])
    );

    // AUTO-UNLOCK LOGIC for all levels
    let finalCompletedLevels = [...updatedCompleted];
    
    // If completed beginner, unlock domain-specific
    if (levelId === 'beginner') {
      finalCompletedLevels = Array.from(new Set([...finalCompletedLevels, 'domain-specific']));
    }
    
    // If completed domain-specific, unlock ALL 8 domain levels
    if (levelId === 'domain-specific') {
      const allDomains = [
        'content-writing',
        'marketing', 
        'coding',
        'data-analysis',
        'education',
        'business',
        'fashion',
        'health'
      ];
      finalCompletedLevels = Array.from(new Set([...finalCompletedLevels, ...allDomains]));
    }
    
    // If a domain was completed, keep advanced access separate from completion.
    // Advanced levels should only appear completed after the user actually finishes them.
    const advancedMap: Record<string, string> = {
      'content-writing': 'advanced-content-writing',
      'marketing': 'advanced-marketing',
      'coding': 'advanced-coding',
      'data-analysis': 'advanced-data-analysis',
      'education': 'advanced-education',
      'business': 'advanced-business',
      'fashion': 'advanced-fashion',
      'health': 'advanced-health'
    };

    if (advancedMap[levelId]) {
      const advancedLevelId = advancedMap[levelId];
      const hasAdvancedCertificate = Array.isArray(progress.certifications) &&
        progress.certifications.some((cert: any) => cert?.id === advancedLevelId);

      if (!hasAdvancedCertificate) {
        finalCompletedLevels = finalCompletedLevels.filter(id => id !== advancedLevelId);
      }
    }

    const learnerName =
      storedProgress?.profile?.fullName ||
      localStorage.getItem("certUserName") ||
      "Student";

    // Create certificate object in old format
    const today = new Date();
    const dateStr = String(today.getDate()).padStart(2, "0") + "/" + 
                    String(today.getMonth() + 1).padStart(2, "0") + "/" + 
                    today.getFullYear();

    const newCertificate = {
      id: levelId,
      levelName: certLabelMap[levelId] || resolvedCourse,
      date: dateStr,
      learnerName: learnerName
    };

    // Check if this certificate already exists (by id)
    const certExists = Array.isArray(progress.certifications) && 
                       progress.certifications.some((cert: any) => cert.id === levelId);
    
    let updatedCerts = certExists
      ? progress.certifications
      : [...(progress.certifications || []), newCertificate];

    console.log("📊 Saving to backend:", {
      levelId,
      course: resolvedCourse,
      newCertificate,
      completedLevels: finalCompletedLevels,
      certifications: updatedCerts
    });

    let backendSuccess = false;
    try {
      const response = await fetch(`${API_BASE_URL}/save-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentLevelId: levelId,
          completedLevels: finalCompletedLevels,
          certifications: updatedCerts,
          learnerName: learnerName
        })
      });

      const data = await response.json();
      console.log("✅ Backend response status:", response.status);
      console.log("✅ Backend response data:", data);

      if (!response.ok) {
        console.error("❌ Backend error - Status:", response.status);
        console.error("❌ Backend error data:", data);
      } else {
        backendSuccess = true;
        console.log("✅ Successfully saved to backend!");
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
    }

    console.log(`📝 Saving to localStorage (backend success: ${backendSuccess})`);

    // Save to user-specific userProgress localStorage (important for Dashboard)
    const localStorageData = {
      currentLevelId: levelId,
      completedLevels: finalCompletedLevels,
      certifications: updatedCerts
    };

    localStorage.setItem(
      getEmailKey("userProgress"),
      JSON.stringify(localStorageData)
    );

    // Save to user-specific prompt_master_data
    localStorage.setItem(
      getEmailKey("prompt_master_data"),
      JSON.stringify({
        profile: storedProgress.profile || null,
        progress: localStorageData
      })
    );

    // Also save to generic UserProgress for backward compatibility
    localStorage.setItem(
      "UserProgress",
      JSON.stringify({
        profile: storedProgress.profile || null,
        progress: localStorageData
      })
    );

    console.log("✅ Saved to localStorage");
    console.log("📱 LocalStorage updated:", localStorageData);

    //navigate("/course");
    onCompleteLevel?.(levelId, resolvedCourse);

    //navigate("/course", { replace: true });
    //window.location.reload(); // forces dashboard to reload and show updated progress

  };



  /*const teleport = async () => {
  if (!levelId) return;

  onCompleteLevel?.(levelId, course);

  const token = localStorage.getItem("token");

  const storedProgress =
    JSON.parse(localStorage.getItem("userProgress") || "{}");

  const updatedCompleted = Array.from(
    new Set([...(storedProgress.completedLevels || []), levelId])
  );

 await fetch(`${API_BASE_URL}/save-progress`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    currentLevelId: levelId,
    completedLevels: updatedCompleted
  })
});

  localStorage.setItem(
    "userProgress",
    JSON.stringify({
      currentLevelId: levelId,
      completedLevels: updatedCompleted
    })
  );

  navigate("/course");
};*/

  /* ================= DOWNLOAD CERTIFICATE =================
  const downloadCertificate = () => {
    const element = document.getElementById('certificate-area');
    if (!element) return;

    html2pdf()
      .set({
        margin: 0,
        filename: `Certificate-${certId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      })
      .from(element)
      .save();
  };*/


  const downloadCertificate = () => {
    const element = document.getElementById('certificate-area');
    if (!element) return;
    
    const actionButtons = document.querySelector('.certificate-actions') as Element | null;
    
    html2pdf()
      .set({
        margin: 0,
        filename: `Certificate-${certId}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          scrollY: 0,
          ignoreElements: (el) => el === actionButtons
        },
        jsPDF: {
          unit: 'px',
          format: [1123, 794],
          orientation: 'landscape'
        }
      })
      .from(element)
      .save();
  };




  // ================= SHARE GENERIC =================
  const shareCertificate = async () => {
    if (!navigator.share) {
      alert('Sharing not supported on this device');
      return;
    }

    await navigator.share({
      title: 'My Certificate',
      text: `I completed ${completedCourseName} 🎓`,
      url: window.location.href,
    });
  };

  // ================= LINKEDIN SHARE =================
  const shareOnLinkedIn = () => {
    const certificateUrl =
      `${window.location.origin}/verify?certId=${certId}`;

    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateUrl)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-10" >
      <h1 className="text-3xl font-bold text-center mb-10">
        Congratulations on successfully completing {completedCourseName} from Zennithindia
      </h1>



      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8" style={{ borderRadius: "30px", boxShadow: "0 10px 38px rgba(0,0,0,0.6)" }}>

        {/* LEFT SIDE — CERTIFICATE */}
        <div className="md:col-span-3 bg-white shadow-lg rounded-xl p-6">
          <Certificate
            learnerName={resolvedLearnerName}
            courseLevel={completedCourseName || "Completed Course"}
            certId={certId || "unknown"}
            date={formattedDate}//{new Date().toLocaleDateString()}
            onContinue={teleport}//{() => window.location.href = '/'}
          />
        </div>

      </div>
    </div>
  );
};

export default VerifyCertificate;
