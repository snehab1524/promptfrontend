import React, { useState, useEffect } from 'react';
import "./dashbord.css";
import { useNavigate, Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../api';

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [timer, setTimer] = useState(120);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    let interval;
    if (isCounting && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCounting, timer]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setOtp("");
    setTimer(120);
    setIsCounting(false);
  };

  const handelRegister = async (e) => {
    if (e) e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/send-otp`, {
        fullName,
        email,
        password
      });

      setShowOtpForm(true);
      setTimer(120);
      setIsCounting(true);
      
      if (response.data.status === 'otp_generated_email_failed') {
        alert("OTP generated! Check server logs - email delivery failed. Try verify anyway.");
      } else {
        alert("✅ OTP sent to your email! Check inbox/spam.");
      }

    } catch (err) {
      console.error("Send OTP error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to send OTP. Server running?");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post(`${API_BASE_URL}/verify-otp`, {
        email,
        otp
      });

      alert("Registration Successful ✅ Welcome to AIINSIGHT!");
      resetForm();
      navigate("/login");

    } catch (err) {
      console.error("Verify OTP error:", err.response?.data || err);
      alert(err.response?.data?.message || "Invalid or Expired OTP");
    }
  };

  return (
    <div className="register-wrapper">

      <div className="register-card">

        <FaTimesCircle
          className="close-icon"
          onClick={() => navigate("/")}
        />

        {!showOtpForm ? (
          <>
            <h2 className="register-title">Create Account</h2>

            <form onSubmit={handelRegister}>

              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="primary-btn">
                Register
              </button>

            </form>
          </>
        ) : (
          <>
            <h2 className="register-title">Verify OTP</h2>

            <div className="input-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <p className="timer">
              Time Remaining: {Math.floor(timer / 60)}:
              {timer % 60 < 10 ? `0${timer % 60}` : timer % 60}
            </p>

            <button
              onClick={handleVerifyOtp}
              disabled={timer === 0}
              className="primary-btn"
            >
              Verify & Register
            </button>

            {timer === 0 && (
              <button
                onClick={handelRegister}
                className="secondary-btn"
              >
                Resend OTP
              </button>
            )}
          </>
        )}

        <p className="footer-text">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

      </div>

      {/* CSS Inside Same File */}
      <style>{`

        .register-wrapper {
          min-height: 100vh;
          background: #0f0f0f;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .register-card {
          background: #1a1a1a;
          padding: 40px;
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          color: white;
          position: relative;
          box-shadow: 0 15px 40px rgba(0,0,0,0.6);
        }

        .close-icon {
          position: absolute;
          top: 15px;
          right: 15px;
          font-size: 22px;
          cursor: pointer;
          color: #aaa;
          transition: 0.3s;
        }

        .close-icon:hover {
          color: white;
        }

        .register-title {
          text-align: center;
          font-size: 26px;
          margin-bottom: 30px;
          font-weight: 600;
        }

        .input-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
        }

        .input-group label {
          margin-bottom: 6px;
          font-size: 14px;
          color: #bbb;
        }

        .input-group input {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #333;
          background: #111;
          color: white;
          font-size: 14px;
          transition: 0.3s;
        }

        .input-group input:focus {
          outline: none;
          border-color: #666;
        }

        .primary-btn {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: none;
          background: white;
          color: black;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .primary-btn:hover {
          background: #e5e5e5;
        }

        .primary-btn:disabled {
          background: #444;
          color: #999;
          cursor: not-allowed;
        }

        .secondary-btn {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #555;
          background: transparent;
          color: white;
          margin-top: 12px;
          cursor: pointer;
          transition: 0.3s;
        }

        .secondary-btn:hover {
          background: white;
          color: black;
        }

        .timer {
          text-align: center;
          margin-bottom: 15px;
          color: #aaa;
          font-size: 14px;
        }

        .footer-text {
          margin-top: 25px;
          text-align: center;
          font-size: 14px;
          color: #aaa;
        }

        .footer-text a {
          color: white;
          font-weight: 600;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .register-card {
            padding: 25px;
          }

          .register-title {
            font-size: 20px;
          }
        }

      `}</style>

    </div>
  );
};

export default Register;
