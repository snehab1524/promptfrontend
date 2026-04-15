import React, { useState } from "react";

const AadhaarVerification = ({ onVerified }: { onVerified: () => void }) => {
  onVerified();   // direct verified maan lo
  return null;

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 SEND OTP
  const sendOtp = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/send-otp", {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile: phone,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setOtpSent(true);
        alert("OTP sent successfully");
      } else {
        alert("Failed to send OTP");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Backend not reachable");
    }
  };

  // 🔹 VERIFY OTP
  const verifyOtp = async () => {
    try {
      const res = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
       body: JSON.stringify({
  mobile: phone.trim(),
  otp: otp.trim(),
}),

      });

      const data = await res.json();

      if (data.verified) {
        alert("OTP verified successfully");
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Mobile Verification</h2>

      <input
        type="tel"
        placeholder="Enter mobile number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />

      {!otpSent && (
        <button
          type="button"
          onClick={sendOtp}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      )}

      {otpSent && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border p-2 rounded mt-4 mb-3"
          />

          <button
            type="button"
            onClick={verifyOtp}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
};

export default AadhaarVerification;
