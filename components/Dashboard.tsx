import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, UserProgress, LevelId, DomainId, AdvancedId } from '../types';
import { COURSE_CONTENT } from '../constants';
import html2pdf from 'html2pdf.js';


import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo2.png';
import { API_BASE_URL } from '../api';





interface Props {
  profile: UserProfile;
  progress: UserProgress;
  onStartLevel: (id: string) => void;
  onDownloadCertificate: (id: string) => void;
  onComplete: (profile: UserProfile) => void;
  onProgressUpdate?: (progress: UserProgress) => void;
}

const Dashboard: React.FC<Props> = ({ profile, progress, onStartLevel, onDownloadCertificate, onComplete, onProgressUpdate }) => {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [citizen, setCitizen] = useState("");
  const [paymentVerified, setPaymentVerified] = useState("NO Payment");
  const [courseName, setCourseName] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [paymentstatus, setPaymentstatus] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [showAdvancedDomains, setShowAdvancedDomains] = useState(false);
  const [showDomains, setShowDomains] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [purchasedDomains, setPurchasedDomains] = useState<string[]>([]);
  const [showDomainPurchaseModal, setShowDomainPurchaseModal] = useState(false);
  const [masterData, setMasterData] = useState<any>({});

  const navigate = useNavigate();
  const [progresslevel, setProgresslevel] = useState<UserProgress>(progress);

  // Sync progresslevel with progress prop
  useEffect(() => {
    setProgresslevel(progress);
  }, [progress]);

  const saveProgressToLocalStorage = (progress: UserProgress) => {
    const key = getEmailKey('userProgress');
    localStorage.setItem(key, JSON.stringify(progress));
  };


  const getEmailKey = (key: string): string => {
    const userStr = localStorage.getItem("user");
    const email = userStr ? JSON.parse(userStr).email : 'default';
    return `${key}_${email.replace(/[@.]/g, '_')}`;
  };


  const getPromptMasterData = () => {
    const key = getEmailKey('prompt_master_data');
    return JSON.parse(localStorage.getItem(key) || "{}");
  };


const getCertIdByLevel = (levelId: string) => {
    const certs = progresslevel.certifications || [];
    
    // Find certificate with matching id (old object format)
    const cert = Array.isArray(certs) && certs.find((c: any) => c && c.id === levelId);
    if (cert) {
      return (cert as any).certId || cert.id || levelId; // Return certId if available, otherwise use stored id
    }
    
    return null;
  };

  const downloadCertificate = (certId: string) => {
    navigate(`/verify?certId=${certId}`);
  };

  const openCertificate = async (levelId: string, course: string) => {
    // Refresh progress before opening cert
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await axios.post(`${API_BASE_URL}/get-progress`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const backendProgress = {
          completedLevels: res.data.completedLevels || [],
          currentLevelId: res.data.currentLevelId || "",
          certifications: res.data.certifications || []
        };
        setProgresslevel(backendProgress);
      }
    } catch (err) {
      console.error("Pre-cert refresh failed:", err);
    }
    
    const certId = getCertIdByLevel(levelId);
    if (!certId) {
      alert("Certificate not found - complete the level first");
      return;
    }
    navigate("/verify", { state: { certId, levelId, courseName: course } });
  };

  // Handle payment click
  const handleUpgradePayment = async () => {
    const token = localStorage.getItem('token');
    if (!selectedCourse) {
      alert("Please select a course package first!");
      return;
    }
    
    console.log("=== STARTING COURSE UPGRADE PAYMENT ===");
    console.log("Course:", selectedCourse);
    
    try {
      console.log("Creating payment order for course...");
      const res = await fetch(`${API_BASE_URL}/test-razorpay`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ courseName: selectedCourse }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Order creation failed:", errorText);
        alert("Failed to create order: " + errorText);
        return;
      }
      
      const order = await res.json();
      console.log("Order created:", order);
      console.log("Order ID:", order.orderId);
      console.log("Amount:", order.amount);

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "AIINSIGHT",
        description: "Course Enrollment: " + selectedCourse,
        order_id: order.orderId,
        handler: async function (response: any) {
          console.log("=== RAZORPAY PAYMENT RESPONSE ===");
          console.log("Response:", response);
          
          if (!response.razorpay_payment_id) {
            console.log("Payment was cancelled by user");
            alert("Payment was cancelled");
            return;
          }
          
          try {
            console.log("=== SENDING VERIFICATION REQUEST ===");
            console.log("Course:", selectedCourse);
            console.log("Order ID:", response.razorpay_order_id);
            console.log("Payment ID:", response.razorpay_payment_id);
            
            const verifyRes = await fetch(`${API_BASE_URL}/verify-payment`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseName: selectedCourse,
                selectedDomain: selectedCourse === "DomainCourse" ? selectedDomain : null,
              }),
            });

            console.log("Verification response status:", verifyRes.status);
            
            if (!verifyRes.ok) {
              const errorText = await verifyRes.text();
              console.error("Verification failed:", verifyRes.status, errorText);
              alert("Payment verification failed: " + errorText);
              return;
            }

            const verifyData = await verifyRes.json();
            console.log("Verification response:", verifyData);

            if (verifyData.success) {
              console.log("Payment verified successfully!");
              alert("Payment verified successfully! Your course has been activated.");
              
              const master = JSON.parse(localStorage.getItem("prompt_master_data") || "{}");
              master.courseName = selectedCourse;
              master.payment_verified = "Payment Done";
              
              // For DomainCourse, add the selected domain to purchasedDomains array
              if (selectedCourse === "DomainCourse" && selectedDomain) {
                master.selectedDomain = selectedDomain;
                // Also add to purchasedDomains if not already present
                const existingDomains = master.purchasedDomains || [];
                if (!existingDomains.includes(selectedDomain)) {
                  master.purchasedDomains = [...existingDomains, selectedDomain];
                }
              }

              localStorage.setItem("prompt_master_data", JSON.stringify(master));
              setMasterData(master);
              
              onComplete(master);
            } else {
              console.error("Verification failed:", verifyData.message);
              alert("Payment verification failed: " + (verifyData.message || "Unknown error"));
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Verification error. Please contact support.");
          }
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initialization error:", err);
      alert("Payment failed. Please try again.");
    }
  };

  // Handle purchase of individual domain
  const handlePurchaseDomain = async (domainId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login first");
      return;
    }
    
    console.log("=== STARTING DOMAIN PURCHASE ===");
    console.log("Domain ID:", domainId);
    
    try {
      console.log("Creating payment order...");
      const res = await fetch(`${API_BASE_URL}/test-razorpay`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ courseName: "IndividualDomain", domainId }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Order creation failed:", errorText);
        alert("Failed to create order: " + errorText);
        return;
      }
      
      const order = await res.json();
      console.log("Order created successfully:", order);

      // Store token in a variable to use in handler
      const authToken = token;

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "AIINSIGHT",
        description: `Domain: ${domainId}`,
        order_id: order.orderId,
        handler: async function (response: any) {
          console.log("=== RAZORPAY PAYMENT RESPONSE ===");
          console.log("Response:", response);
          
          if (!response.razorpay_payment_id) {
            console.log("Payment was cancelled by user");
            alert("Payment was cancelled");
            return;
          }
          
          try {
            console.log("=== SENDING VERIFICATION REQUEST ===");
            console.log("Domain:", domainId);
            console.log("Order ID:", response.razorpay_order_id);
            console.log("Payment ID:", response.razorpay_payment_id);
            
            const verifyRes = await fetch(`${API_BASE_URL}/verify-domain-payment`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                domainId,
              }),
            });

            console.log("Verification response status:", verifyRes.status);
            console.log("Verification response headers:", verifyRes.headers);
            
            if (!verifyRes.ok) {
              const errorText = await verifyRes.text();
              console.error("Verification failed with status:", verifyRes.status, "Error:", errorText);
              alert("Payment verification failed: Server error (" + verifyRes.status + "): " + errorText);
              return;
            }

            const verifyData = await verifyRes.json();
            console.log("Verification response data:", verifyData);

            if (verifyData.success) {
              console.log("Payment verified successfully!");
              console.log("Purchased domains:", verifyData.data?.purchasedDomains);
              
              // Update local state with new purchased domain
              const newPurchasedDomains = [...purchasedDomains, domainId];
              setPurchasedDomains(newPurchasedDomains);
              
              // Update localStorage
              const master = JSON.parse(localStorage.getItem("prompt_master_data") || "{}");
              master.purchasedDomains = newPurchasedDomains;
              localStorage.setItem("prompt_master_data", JSON.stringify(master));
              setMasterData(master);
              
              // Refresh the course status from backend
              try {
                console.log("Refreshing course status from backend...");
                const res = await axios.get(`${API_BASE_URL}/my-course-status`, {
                  headers: { Authorization: `Bearer ${authToken}` }
                });
                const data = res.data.data || res.data;
                const purchasedDomainsFromBackend = data.purchasedDomains || [];
                console.log("Backend purchased domains:", purchasedDomainsFromBackend);
                setPurchasedDomains(purchasedDomainsFromBackend);
                
                const updatedMaster = {
                  ...master,
                  purchasedDomains: purchasedDomainsFromBackend
                };
                localStorage.setItem("prompt_master_data", JSON.stringify(updatedMaster));
                setMasterData(updatedMaster);
              } catch (err) {
                console.error("Error refreshing course status:", err);
              }
              
              alert(`${domainId} domain purchased successfully!`);
              setShowDomainPurchaseModal(false);
            } else {
              console.error("Verification failed:", verifyData.message);
              alert("Payment verification failed: " + (verifyData.message || "Unknown error"));
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Verification error. Please contact support.");
          }
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed by user");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initialization error:", err);
      alert("Payment failed. Please try again.");
    }
  };

  // Load user data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem("prompt_master_data");
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFullname(user.fullName || "");
      setEmail(user.email || "");
    }
    
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setProgresslevel({
        completedLevels: parsed.progress?.completedLevels || [],
        currentLevelId: parsed.progress?.currentLevelId || "",
        certifications: parsed.progress?.certifications || []
      });
    }
  }, []);

  // Fetch details from backend
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchdata = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/my-course-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setCourseName(data.courseName);
        setCitizen(data.citizen);
        setPhone(data.phone);
        setPaymentstatus(data.payment_verified);
        
        // Get purchased domains from backend
        const purchasedDomainsFromBackend = data.purchasedDomains || [];
        setPurchasedDomains(purchasedDomainsFromBackend);

        const updatedMaster = {
          ...masterData,
          courseName: data.courseName,
          payment_verified: data.payment_verified,
          selectedDomain: data.selectedDomain || null,
          purchasedDomains: purchasedDomainsFromBackend
        };

        localStorage.setItem("prompt_master_data", JSON.stringify(updatedMaster));
        setMasterData(updatedMaster);
      } catch (err) {
        console.error({ error: (err as Error).message });
      }
    };
    fetchdata();
  }, []);

  // Consolidated progress fetching with polling
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;
    
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("⚠️ No token found in localStorage");
          return;
        }
        
        const res = await axios.post(`${API_BASE_URL}/get-progress`, 
          {},
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            timeout: 5000
          }
        );

        const backendProgress = {
          completedLevels: res.data.completedLevels || [],
          currentLevelId: res.data.currentLevelId || "",
          certifications: res.data.certifications || []
        };

        setProgresslevel(backendProgress);
        const progressKey = getEmailKey('userProgress') as string;
        localStorage.setItem(progressKey, JSON.stringify(backendProgress));
        
        retryCount = 0; // Reset retry count on success

        // Debug logs removed to fix console spam (preserves advanced levels check silently)
        const advancedLevels = backendProgress.completedLevels.filter((l: string) => l.includes('advanced-'));
        // if (advancedLevels.length > 0) {
        //   console.log("✅ Advanced levels found:", advancedLevels);
        //   console.log("📊 Current certificates:", backendProgress.certifications);
        // }

        if (onProgressUpdate) {
          onProgressUpdate(backendProgress);
        }
      } catch (err: any) {
        console.error("❌ Error fetching progress:", {
          message: err.message,
          code: err.code,
          status: err.response?.status,
          isNetwork: err.message.includes('Network') || err.code === 'ECONNREFUSED'
        });

        // Fallback to localStorage if backend is down
        try {
          const progressKey = getEmailKey('userProgress') as string;
          const cached = localStorage.getItem(progressKey);
          if (cached) {
            console.log("📦 Using cached progress from localStorage");
            setProgresslevel(JSON.parse(cached));
          }
        } catch (e) {
          console.error("Failed to read cached progress:", e);
        }

        // Retry with exponential backoff
        if (retryCount < maxRetries) {
          retryCount++;
          const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
          console.log(`📡 Retrying in ${delay}ms (attempt ${retryCount}/${maxRetries})`);
          setTimeout(fetchProgress, delay);
        }
      }
    };
    
    fetchProgress(); // Initial fetch immediately
    intervalId = setInterval(fetchProgress, 5000); // Poll every 5s
    
    return () => clearInterval(intervalId);
  }, []);

  // Initialize selectedDomain from masterData
  useEffect(() => {
    if (masterData.selectedDomain) {
      setSelectedDomain(masterData.selectedDomain);
    }
    // Initialize purchased domains
    if (masterData.purchasedDomains) {
      setPurchasedDomains(masterData.purchasedDomains);
    }
  }, [masterData]);

  // Force refresh when component mounts to get latest data
  useEffect(() => {
    const refreshData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        // Preserve existing progress from localStorage before refreshing
        const existingProgress = localStorage.getItem("userProgress");
        let existingMasterData = localStorage.getItem("prompt_master_data");
        
        const res = await axios.get(`${API_BASE_URL}/my-course-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        
        // Update state with fresh data from backend
        setCourseName(data.courseName || "");
        setPaymentstatus(data.payment_verified || "");
        
        if (data.selectedDomain) {
          setSelectedDomain(data.selectedDomain);
        }
        
        const purchasedDomainsFromBackend = data.purchasedDomains || [];
        setPurchasedDomains(purchasedDomainsFromBackend);

        // Merge existing progress with fresh backend data
        let parsedMaster = {};
        if (existingMasterData) {
          try {
            parsedMaster = JSON.parse(existingMasterData);
          } catch (e) {
            console.error("Error parsing master data:", e);
          }
        }

        const updatedMasterData = {
          ...parsedMaster,
          courseName: data.courseName || "",
          payment_verified: data.payment_verified || "",
          selectedDomain: data.selectedDomain || null,
          purchasedDomains: purchasedDomainsFromBackend,
          profile: JSON.parse(localStorage.getItem("user") || "{}"),
        };
        
        // Only restore progress if it exists
        if (existingProgress) {
          try {
            const parsedProgress = JSON.parse(existingProgress);
            (updatedMasterData as any).progress = parsedProgress;
          } catch (e) {
            console.error("Error parsing existing progress:", e);
          }
        }

        localStorage.setItem("prompt_master_data", JSON.stringify(updatedMasterData));
        setMasterData(updatedMasterData);
        
        // Auto-show domains for DomainCourse/FullCourse users with payment done
        if ((data.courseName === 'DomainCourse' || data.courseName === 'FullCourse') && data.payment_verified === 'Payment Done') {
          setShowDomains(true);
          setShowAdvancedDomains(true);
        }
      } catch (err) {
        console.error("Error refreshing data:", err);
      }
    };
    
    refreshData();
  }, []);

// Updated progression-based unlock configuration
  const unlockConfig = useMemo(() => {
    const beginnerDone = progresslevel.completedLevels.includes('beginner');
    const domainDone = progresslevel.completedLevels.some(level => 
      ['content-writing', 'marketing', 'coding', 'data-analysis', 'education', 'business', 'fashion', 'health'].includes(level)
    );
    const hasFullCourse = courseName === 'FullCourse' && paymentstatus === 'Payment Done';
    const hasAllDomains = (masterData.purchasedDomains || []).length >= 8;
    const purchasedDomains = masterData.purchasedDomains || [];

    const config = {
      isBeginnerUnlocked: true, // Always accessible after registration
      isDomainUnlocked: beginnerDone, // Level 2 unlocks after L1
      isAdvancedUnlocked: beginnerDone, // Level 3 unlocks together with L2 after L1
      hasFullCourse,
      isFullAccess: hasFullCourse || hasAllDomains,
      purchasedDomains,
      beginnerDone // Expose for UI
    };

    return config;
  }, [paymentstatus, courseName, progresslevel.completedLevels, masterData.purchasedDomains]);

  const canAccessDomain = (domainId: string) => {
    // Full access bypass or specific purchase
    const hasPurchasedDomain = unlockConfig.purchasedDomains && 
      (unlockConfig.purchasedDomains.includes(domainId) || unlockConfig.purchasedDomains.includes('all') || unlockConfig.isFullAccess);
    
    return hasPurchasedDomain;
  };

  const canAccessAdvancedDomain = (domainId: string) => {
    // Get the base domain from advanced domain (e.g., 'advanced-business' -> 'business')
    const baseDomainId = domainId.replace('advanced-', '');
    
    // Full access bypass or specific purchase
    const hasPurchasedDomain = unlockConfig.purchasedDomains && 
      (unlockConfig.purchasedDomains.includes(baseDomainId) || unlockConfig.purchasedDomains.includes('all') || unlockConfig.isFullAccess);
    
    return hasPurchasedDomain;
  };

  const levels = [
    { id: LevelId.BEGINNER, name: 'Beginner Level', desc: 'The basics of AI & Prompting' },
    {
      id: LevelId.DOMAIN_SPECIFIC,
      name: 'Domain Specific',
      desc: 'Expertise in specific industries',
      domains: [
        { id: DomainId.CONTENT_WRITING, name: 'Content Writing' },
        { id: DomainId.MARKETING, name: 'Marketing & Ads' },
        { id: DomainId.CODING, name: 'Coding & Dev' },
        { id: DomainId.DATA_ANALYSIS, name: 'Data Analysis' },
        { id: DomainId.EDUCATION, name: 'Education' },
        { id: DomainId.BUSINESS, name: 'Business' },
        { id: DomainId.FASHION, name: 'Fashion' },
        { id: DomainId.HEALTH, name: 'Health' }
      ]
    },
    {
      id: LevelId.ADVANCED,
      name: 'Advanced Level',
      desc: 'Chaining & Optimization',
      domains: [
        { id: AdvancedId.CONTENT_WRITING, name: 'Content Writing' },
        { id: AdvancedId.MARKETING, name: 'Marketing & Ads' },
        { id: AdvancedId.CODING, name: 'Coding & Dev' },
        { id: AdvancedId.DATA_ANALYSIS, name: 'Data Analysis' },
        { id: AdvancedId.EDUCATION, name: 'Education' },
        { id: AdvancedId.BUSINESS, name: 'Business' },
        { id: AdvancedId.FASHION, name: 'Fashion' },
        { id: AdvancedId.HEALTH, name: 'Health' }
      ]
    }
  ];

  const totalPossibleItems = 1 + 8 + 8;
  const progressPercent = Math.round((progresslevel.completedLevels.length / totalPossibleItems) * 100);

  const isLevelCompleted = (id: string) => progresslevel.completedLevels.includes(id);
  const isBeginnerCompleted = isLevelCompleted(LevelId.BEGINNER);
  const isLevel2Completed = isLevelCompleted(DomainId.CONTENT_WRITING) || isLevelCompleted(DomainId.MARKETING) || isLevelCompleted(DomainId.CODING) || isLevelCompleted(DomainId.DATA_ANALYSIS) || isLevelCompleted(DomainId.EDUCATION) || isLevelCompleted(DomainId.BUSINESS) || isLevelCompleted(DomainId.FASHION) || isLevelCompleted(DomainId.HEALTH);

  const level2AccessibleDomains = unlockConfig.hasFullCourse || unlockConfig.isFullAccess
    ? (levels[1].domains || [])
    : (levels[1].domains || []).filter(d => unlockConfig.purchasedDomains?.includes(d.id));
  const level3AccessibleDomains = unlockConfig.hasFullCourse || unlockConfig.isFullAccess
    ? (levels[2].domains || [])
    : (levels[2].domains || []).filter(d => unlockConfig.purchasedDomains?.includes(d.id.replace('advanced-', '')));

  const completedDomainsCount = level2AccessibleDomains.filter(d => isLevelCompleted(d.id)).length;
  const completedAdvancedCount = level3AccessibleDomains.filter(d => isLevelCompleted(d.id)).length;
  const totalLevel2Domains = level2AccessibleDomains.length;
  const totalLevel3Domains = level3AccessibleDomains.length;

  const getProgressWidth = (completed: number, total: number) => {
    if (!total) return 0;
    return Math.min(100, Math.max(0, (completed / total) * 100));
  };

  const level2ProgressWidth = getProgressWidth(completedDomainsCount, totalLevel2Domains);
  const level3ProgressWidth = getProgressWidth(completedAdvancedCount, totalLevel3Domains);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12" style={{ background: "black", borderRadius: "20px", marginTop: "3vw", boxShadow: "0 10px 28px rgba(255,255,255,0.6)" }}>
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div style={{ marginLeft: "2vw" }}>
          <div className="flex items-center gap-3 mb-2">
            <img src={logo} alt="AIINSIGHT Logo" style={{ height: "80px", width: "auto", objectFit: "contain" }} />
          </div>
          <h1 className="text-4xl font-extrabold text-grey-900 mb-2" style={{ color: "white" }}>Welcome, {fullname}! 👋</h1>
          <p className="text-gray-600 text-lg" style={{ color: "white" }}>Your Prompt Engineering learning journey.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-[240px] me-5" style={{ color: "white", background: "black", borderRadius: "20px", width: "max-content", boxShadow: "0 4px 10px rgba(255,255,255,0.9)", padding: "1vw" }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500" style={{ color: "white" }}>Overall Progress</span>
            <span className="text-sm font-bold text-indigo-600" style={{ color: "white" }}>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3" style={{ border: "solid 2px grey", boxShadow: "0 2px 6px rgba(255,255,255,0.6)" }}>
            <div className="bg-black h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </header>

      <section className="mb-16" style={{ margin: "2vw" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-black text-black bg-gray-200 px-6 py-3 rounded-xl border border-gray-400 shadow-md w-fit">
            Learning Roadmap
          </h2>
{(unlockConfig.isDomainUnlocked || unlockConfig.isAdvancedUnlocked) && !unlockConfig.hasFullCourse && (
            <span className="bg-black text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full animate-pulse shadow">
              {unlockConfig.hasFullCourse ? 'Full Access - All Unlocked!' : 'Levels 2+3 Unlocked - Purchase Domains to Access'}
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Level 1: Beginner */}
          <div className={`p-8 rounded-3xl border-2 transition-all flex flex-col h-full ${isLevelCompleted(LevelId.BEGINNER) ? 'bg-green-50 border-green-200' : !unlockConfig.isBeginnerUnlocked ? 'bg-gray-50 opacity-90' : 'bg-white border-indigo-100 shadow-xl'}`} style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.8)" }}>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 mb-4 inline-block w-fit">Level 1</span>
            <h3 className="text-xl text-black font-bold mb-2">Beginner</h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow">Master the fundamental principles of Large Language Models and clear instruction writing.</p>
            {!unlockConfig.isBeginnerUnlocked ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Purchase a course to unlock</p>
               
              </div>
            ) : isLevelCompleted(LevelId.BEGINNER) ? (
              <button onClick={() => openCertificate("beginner", "Beginner Prompting")} className="w-full py-3 bg-white border border-green-200 text-green-700 rounded-xl font-bold hover:bg-green-100 transition-colors">Download Certificate</button>
            ) : (
              <button id="btn1" onClick={() => onStartLevel(LevelId.BEGINNER)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700">Start Learning</button>
            )}
          </div>

          {/* Level 2: Domain Specific */}
          <div className={`p-8 rounded-3xl border-2 transition-all flex flex-col h-full ${unlockConfig.isDomainUnlocked ? 'bg-white border-indigo-100 shadow-xl' : 'bg-gray-50 opacity-60 grayscale'}`} style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.8)" }}>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 mb-4 inline-block w-fit">Level 2</span>
            <h3 className="text-xl text-black font-bold mb-2">Domain Specific</h3>
            <p className="text-gray-500 text-sm mb-4">{unlockConfig.hasFullCourse ? 'All domains unlocked with FullCourse!' : 'Apply techniques to professional fields - purchase domains to unlock access.'}</p>

            {unlockConfig.isDomainUnlocked && (
              <div className="mb-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs font-bold text-gray-400 uppercase mb-2">
                  <span>Progress</span>
                  <span className="break-words text-left sm:text-right">
                    {completedDomainsCount}/{totalLevel2Domains} Domains Completed
                  </span>
                </div>
                <div className="w-full overflow-hidden bg-gray-100 rounded-full h-2 sm:h-2.5">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${level2ProgressWidth}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex-grow">
              {/* Show domains when Level 2 is unlocked */}
              {!unlockConfig.isDomainUnlocked ? (
                <div className="py-3 text-center text-gray-400 font-medium">Complete Beginner level to unlock domains</div>
              ) : (
                <div className="space-y-4">
                  <button onClick={() => setShowDomains(!showDomains)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-gray-1000 transition-all flex items-center justify-center gap-2">
                    {showDomains ? 'Hide Domains' : 'Select Domain'}
                    <svg className={`w-4 h-4 transition-transform ${showDomains ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
              )}
            </div>

            {showDomains && unlockConfig.isDomainUnlocked && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {levels[1].domains?.map(d => {
                  const isAccessible = canAccessDomain(d.id);
                  return (
                    <div key={d.id} className="flex gap-2">
                      <button
                        onClick={() => !isLevelCompleted(d.id) && isAccessible && onStartLevel(d.id)}
                        disabled={!isAccessible || isLevelCompleted(d.id)}
                        className={`flex-grow text-left px-4 py-2 rounded-lg text-sm transition-all flex justify-between items-center ${
                          isLevelCompleted(d.id) ? 'bg-green-100 text-green-800' :
                          isAccessible ? 'bg-gray-50 text-gray-700 hover:bg-indigo-50' :
                          'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {d.name}
                        {isLevelCompleted(d.id) && <span className="text-green-600 font-bold">✓</span>}
                      </button>
                      {isLevelCompleted(d.id) ? (
                        <button onClick={() => openCertificate(d.id, `${d.name} Domain Certificate`)} title="Download Certificate" className="p-2 bg-white border border-green-200 text-green-600 rounded-lg hover:bg-green-50">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Level 3: Advanced */}
          <div className={`p-8 rounded-3xl border-2 transition-all flex flex-col h-full ${unlockConfig.isAdvancedUnlocked ? 'bg-white border-indigo-100 shadow-xl' : 'bg-gray-50 opacity-60 grayscale'}`} style={{ boxShadow: "0 6px 18px rgba(0,0,0,0.8)" }}>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 mb-4 inline-block w-fit">Level 3</span>
            <h3 className="text-xl text-black font-bold mb-2">Advanced</h3>
            <p className="text-gray-500 text-sm mb-4">{unlockConfig.hasFullCourse ? 'All advanced domains unlocked!' : 'Master high-level automation and optimization - purchase domains to unlock advanced content.'}</p>

            {unlockConfig.isAdvancedUnlocked && (
              <div className="mb-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs font-bold text-gray-400 uppercase mb-2">
                  <span>Progress</span>
                  <span className="break-words text-left sm:text-right">
                    {completedAdvancedCount}/{totalLevel3Domains} Domains Completed
                  </span>
                </div>
                <div className="w-full overflow-hidden bg-gray-100 rounded-full h-2 sm:h-2.5">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${level3ProgressWidth}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex-grow">
              {/* Show advanced domains when Level 3 is unlocked */}
              {!unlockConfig.isAdvancedUnlocked ? (
                <div className="py-3 text-center text-gray-400 font-medium">
                  {!unlockConfig.isDomainUnlocked ? 'Complete Beginner level first' : 'Complete Beginner level and purchase Domain or Full Course to unlock Advanced level'}
                </div>
              ) : (
                <div className="space-y-4">
                  <button onClick={() => setShowAdvancedDomains(!showAdvancedDomains)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-gray-1000 transition-all flex items-center justify-center gap-2">
                    {showAdvancedDomains ? "Hide Advanced Domains" : "Select Advanced Domain"}
                    <svg className={`w-4 h-4 transition-transform ${showAdvancedDomains ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                </div>
              )}
            </div>

            {showAdvancedDomains && unlockConfig.isAdvancedUnlocked && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {levels[2].domains?.map(d => {
                  const isAccessible = canAccessAdvancedDomain(d.id);
                  return (
                    <div key={d.id} className="flex gap-2">
                      <button
                        onClick={() => !isLevelCompleted(d.id) && isAccessible && onStartLevel(d.id)}
                        disabled={!isAccessible || isLevelCompleted(d.id)}
                        className={`flex-grow text-left px-4 py-2 rounded-lg text-sm transition-all flex justify-between items-center ${
                          isLevelCompleted(d.id) ? 'bg-green-100 text-green-800' :
                          isAccessible ? 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100' :
                          'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {d.name}
                        {isLevelCompleted(d.id) && <span className="text-green-600 font-bold">✓</span>}
                      </button>
                      {isLevelCompleted(d.id) ? (
                        <button onClick={() => openCertificate(d.id, `${d.name} Advanced Certificate`)} className="p-2 bg-white border border-green-200 text-green-600 rounded-lg hover:bg-green-50">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {progresslevel.certifications && progresslevel.certifications.length > 0 ? (
        <section style={{ margin: "2vw" }}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold ms-9" style={{ color: "white", background: "black", borderRadius: "20px", width: "max-content", boxShadow: "0 4px 10px rgba(255,255,255,0.9)", padding: "1.5vw" }}>COMPLETED CERTIFICATIONS({progresslevel.certifications.length})</h2>
          </div>
          <div className="ms-10 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex flex-nowrap overflow-x-auto space-x-6 pb-6 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900">
              {progresslevel.certifications.slice(0, 6).map((cert: any, idx: number) => (  // Show max 6
                <div key={`cert-${idx}`} className="bg-black w-52 h-28 p-4 rounded-xl shadow-lg flex-shrink-0 text-white text-sm border border-gray-700 hover:shadow-2xl hover:scale-[1.05] transition-all flex flex-col justify-between min-w-[210px]">
                  <div>
                    <h3 className="font-bold text-sm truncate leading-tight">
                      {typeof cert === 'string' ? cert.replace(' Certificate', '') : cert.levelName?.replace(' Certificate', '') || 'Certificate'}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                      Completed
                    </p>
                  </div>
                  <button
                    onClick={() => downloadCertificate(typeof cert === 'string' ? `cert_${idx}` : cert.id)}
                    className="self-end p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center w-9 h-9 shadow-md hover:shadow-lg"
                    title={`View ${typeof cert === 'string' ? cert : cert.levelName}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </button>
                </div>
              ))}

            </div>
          </div>
        </section>
      ) : (
        <section style={{ margin: "2vw" }}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold ms-9" style={{ color: "white", background: "black", borderRadius: "20px", width: "max-content", boxShadow: "0 4px 10px rgba(255,255,255,0.9)", padding: "1.5vw" }}>COMPLETED CERTIFICATES</h2>
          </div>
          <div className="text-center py-20 ms-10">
            <div className="inline-block p-10 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
              <h3 className="text-2xl font-bold text-white mb-4">No Certificates Yet</h3>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">Complete levels to earn beautiful, verifiable certificates that showcase your prompt engineering skills.</p>
              <button 
                onClick={() => onStartLevel('beginner')}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:from-emerald-600 hover:to-teal-700 transition-all"
              >
                Start Beginner Course →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Domain Purchase Prompt - Show after completing beginner course */}
{isBeginnerCompleted && !unlockConfig.hasFullCourse && (
        <section className="mt-8 ms-10 me-10">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-8 rounded-2xl text-white">
            <h2 className="text-2xl font-bold mb-4">Purchase Domains to Unlock Content</h2>
            <p className="mb-6 text-gray-300">Access specific domain content by purchasing individual domains. Each domain costs just ₹249!</p>
            <button 
              onClick={() => setShowDomainPurchaseModal(true)}
              className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
            >
              Browse Available Domains
            </button>
          </div>
        </section>
      )}

      {/* Domain Purchase Modal */}
      {showDomainPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Purchase Additional Domains</h2>
              <button 
                onClick={() => setShowDomainPurchaseModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">Each domain costs ₹249. Select a domain to purchase:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {levels[1].domains?.map(d => {
                const isPurchased = purchasedDomains.includes(d.id) || 
                  (masterData.purchasedDomains && masterData.purchasedDomains.includes(d.id));
                const isCompleted = isLevelCompleted(d.id);
                
                return (
                  <div 
                    key={d.id} 
                    className={`p-4 rounded-xl border-2 ${
                      isPurchased || isCompleted 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: 'black' }}>{d.name}</h3>
                        <p className="text-sm" style={{ color: isCompleted ? 'green' : isPurchased ? 'green' : 'black', fontWeight: isPurchased || isCompleted ? 'bold' : 'normal' }}>
                          {isCompleted ? 'Completed' : isPurchased ? 'Purchased' : '₹249'}
                        </p>
                      </div>
                      {isPurchased || isCompleted ? (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold" style={{ color: 'white' }}>
                          ✓ Owned
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePurchaseDomain(d.id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                        >
                          Buy Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-gray-100 rounded-xl">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> After purchasing a domain, you'll have access to both Level 2 (Domain) and Level 3 (Advanced) content for that domain.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
