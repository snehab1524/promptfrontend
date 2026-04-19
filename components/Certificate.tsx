import React, { useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { QRCodeCanvas } from 'qrcode.react';
import logo from './assets/logo2.png';
import zenithLogo from './assets/zenith.png';
import babydinoLogo from './assets/babydino.png';
import { API_BASE_URL } from '../api';

interface Props {
  learnerName: string;
  courseLevel: string;
  certId: string;
  date: string;
  onContinue: () => void;
}

const Certificate: React.FC<Props> = ({
  learnerName,
  courseLevel,
  certId,
  date,
  onContinue,
}) => {
  const formatCourseName = (value: string) => {
    const normalized = value
      .replace(/^PM-/i, '')
      .replace(/-[A-F0-9]{6,8}$/i, '')
      .replace(/\s+Certificate$/i, '')
      .trim();

    if (!normalized) return '';

    if (normalized.toLowerCase().startsWith('advanced-')) {
      const baseName = normalized
        .replace(/^advanced-/i, '')
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      return `Advanced ${baseName}`;
    }

    if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(normalized)) {
      return normalized
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }

    return normalized;
  };

  const preferredCourseName = courseLevel?.trim();
  const completedCourseName =
    preferredCourseName && preferredCourseName.toLowerCase() !== 'completed course'
      ? formatCourseName(preferredCourseName)
      : formatCourseName(certId) || 'Course Level';

  // ================= DOWNLOAD CERTIFICATE =================
  const downloadCertificate = () => {
    const element = document.getElementById('certificate-area');
    if (!element) return;
    
    const actionButtons = document.querySelector('.certificate-actions') as Element | null;
    
    html2pdf()
      .set({
        margin: 0,
        filename: `Certificate-${certId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          ignoreElements: (el) => el === actionButtons
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
      })
      .from(element)
      .save();
  };

  // ================= SHARE (MOBILE) =================
  const shareCertificate = async () => {
    if (!navigator.share) {
      alert('Sharing not supported on this device');
      return;
    }

    await navigator.share({
      title: 'My Certificate',
      text: `I have successfully completed ${courseLevel}!`,
      url: window.location.href,
    });
  };

  // ================= SHARE ON LINKEDIN =================
  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      `Happy to complete ${courseLevel} 🎓`
    );

    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`,
      '_blank'
    );
  };

  // ================= SAVE CERTIFICATE TO DB =================
useEffect(() => {
    // ✅ PREVENT DUPLICATE SAVE - Only on first download
    if (!certId || localStorage.getItem(`cert_saved_${certId}`)) {
      return;
    }

    const userStr = localStorage.getItem('user');
    const email = userStr ? JSON.parse(userStr).email : null;
    if (!email) {
      console.error('No user email found for cert save');
      return;
    }

    const token = localStorage.getItem("token") || "";
    fetch(`${API_BASE_URL}/generate-certificate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        certificateId: certId,
        name: learnerName,
        course: courseLevel,
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log("✅ Certificate saved to DB:", data);
        localStorage.setItem(`cert_saved_${certId}`, 'true');
      })
      .catch(err => console.error("Cert save failed:", err));
  }, [certId, learnerName, courseLevel]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      
      {/* Certificate Title */}
      <div className="text-center mb-8">
       
      </div>

      {/* ================= CERTIFICATE AREA ================= */}

      <div
        id="certificate-area"
        className="border-4 border-white rounded-2xl shadow-2xl overflow-hidden bg-white flex flex-col lg:flex-row"
        style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
      >
        {/* LEFT SIDE */}
        <div className="w-full lg:w-2/3 p-6 lg:p-12 text-center bg-gradient-to-br from-white to-gray-50 flex flex-col justify-center">
          {/* Zenith Logo at top */}
          <div className="mb-2 lg:mb-4">
            <img src={zenithLogo} alt="Zenith India" className="h-20 lg:h-24 mx-auto object-contain" />
          </div>
          
          <h1 className="text-2xl lg:text-4xl font-extrabold uppercase tracking-widest text-gray-900 mb-2">
            Certificate of Completion
          </h1>


          <p className="text-gray-600 mb-2 lg:mb-4 text-base lg:text-lg">This is to certify that</p>

          <h2 className="text-3xl lg:text-5xl font-serif font-bold text-gray-900 border-b-4 border-white inline-block px-8 lg:px-16 pb-2 lg:pb-4 mb-4 lg:mb-8">
            {learnerName}
          </h2>

          <p className="text-gray-600 leading-relaxed max-w-xl mx-auto text-sm lg:text-lg">
            has successfully completed the
            <br />
            <span className="font-bold text-lg lg:text-xl text-black uppercase  tracking-wide">
              {completedCourseName} 
            </span>
            <br />
           course and demonstrated proficiency in AI tools and prompt engineering.
          </p>

          {/* Verified Badge at bottom on white side */}
          <div className="mt-4 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 lg:gap-3 mb-3">
              <div className="w-10 lg:w-12 h-10 lg:h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 lg:w-8 h-6 lg:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-bold text-base lg:text-lg text-gray-800">Verified Certificate</span>
            </div>
           
          </div>
        </div>

        {/* RIGHT SIDE – VERIFICATION */}
        <div className="w-full lg:w-1/3 bg-gradient-to-br from-gray-900 to-gray-800 p-4 lg:p-8 flex flex-col items-center justify-between">
          {/* Logo2 on right side - reduced size */}
          <div className="mb-2 lg:mb-4">
            <img src={logo} alt="Logo" className="w-24 lg:w-40 h-24 lg:h-40 mx-auto object-contain" />
          </div>
          
          <div className="text-center">
            

            <p className="text-gray-400 text-xs lg:text-sm">Issued on</p>
            <p className="font-mono text-white text-base lg:text-lg mb-4 lg:mb-6">{date}</p>

            {/* ===== REAL SCANNABLE QR ===== */}
            <div className="flex flex-col items-center mt-2 lg:mt-4">
              <div className="bg-white p-2 lg:p-3 rounded-xl shadow-lg">
                <QRCodeCanvas
                  value={`${window.location.origin}/verify?certId=${certId}`}
                  size={100}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                />
              </div>
              <p className="text-white text-xs mt-2 lg:mt-3 font-medium">
                Scan to verify certificate
              </p>
            </div>
          </div>

          <div className="text-center mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-xs">Certificate ID</p>
            <p className="font-mono text-white text-xs lg:text-sm mt-1">{certId}</p>
          </div>
        </div>
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="certificate-actions mt-10">
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-3xl mx-auto">
          <button
            onClick={downloadCertificate}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download Certificate
          </button>

          <button
            onClick={shareCertificate}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
            Share Certificate
          </button>

          <button
            onClick={shareOnLinkedIn}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-xl font-bold hover:from-blue-900 hover:to-blue-950 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
            </svg>
            Share on LinkedIn
          </button>

          <button
            onClick={onContinue}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
