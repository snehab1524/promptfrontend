import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProgress } from '../types';
import Certificate from './Certificate';
import axios from 'axios';

interface Props {
  progress: UserProgress;
  profile: any;
}

const Certificates: React.FC<Props> = ({ progress, profile }) => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState(progress.certifications || []);
  const [loading, setLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  useEffect(() => {
    setCertificates(progress.certifications || []);
  }, [progress.certifications]);

  const openCert = (cert: any) => {
    setSelectedCert(cert);
  };

  const downloadAll = async () => {
    setLoading(true);
    for (const cert of certificates) {
      // Generate PDF logic here or trigger individual downloads
      console.log(`Downloading ${cert.levelName}...`);
    }
    setLoading(false);
  };

  if (!certificates || certificates.length === 0) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center" style={{ background: "black", borderRadius: "20px", marginTop: "3vw", boxShadow: "0 10px 28px rgba(255,255,255,0.6)" }}>
        <div className="inline-block p-12 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
          </svg>
          <h3 className="text-3xl font-bold text-white mb-6">No Certificates Earned</h3>
          <p className="text-gray-300 mb-10 max-w-md mx-auto text-lg">Complete courses to earn verifiable certificates that showcase your prompt engineering mastery.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl hover:from-emerald-600 hover:to-teal-700 transition-all">
            Start Learning →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4" style={{ background: "black", borderRadius: "20px", marginTop: "3vw", boxShadow: "0 10px 28px rgba(255,255,255,0.6)" }}>
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          COMPLETED CERTIFICATES
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Professional, verifiable certificates earned through course completion.
        </p>
      </div>

      {/* CERT LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {Array.isArray(certificates) && certificates.map((cert: any, idx: number) => (
          <div 
            key={`cert-${idx}`}
            className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer"
            onClick={() => openCert(cert)}
            style={{ boxShadow: "0 8px 32px rgba(255,255,255,0.1)" }}
          >
            <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-6 flex items-center justify-center">
              <svg className="w-24 h-24 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 truncate">
              {typeof cert === 'string' ? cert : cert.levelName || 'Certificate'}
            </h3>
            <p className="text-gray-400 mb-4">Completed</p>
            <p className="text-indigo-300 text-sm font-medium">Certificate #{idx + 1}</p>
            <div className="flex gap-2 mt-6 opacity-0 group-hover:opacity-100 transition-all">
              <button className="flex-1 bg-emerald-500/80 hover:bg-emerald-600 text-white py-2 px-4 rounded-xl font-bold text-sm transition-all">
                View
              </button>
              <button className="px-4 bg-blue-500/80 hover:bg-blue-600 text-white py-2 rounded-xl font-bold text-sm transition-all">
                ↓ PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCert && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <Certificate
              learnerName={selectedCert.learnerName || profile.fullName || 'Learner'}
              courseLevel={selectedCert.levelName}
              certId={selectedCert.id}
              date={selectedCert.date}
              onContinue={() => setSelectedCert(null)}
            />
          </div>
        </div>
      )}

      <div className="text-center">
        <button 
          onClick={downloadAll}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-6 rounded-3xl font-black text-xl shadow-2xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Generating...' : `Download All ${certificates.length} Certificates`}
        </button>
      </div>
    </div>
  );
};

export default Certificates;

