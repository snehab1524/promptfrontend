import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api";

const Userlogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loginuser = { email, password };

      const res = await axios.post(
        `${API_BASE_URL}/user-login`,
        loginuser
      );

      // Fetch admin status from backend
      const adminRes = await axios.get(`${API_BASE_URL}/admin-status`, {
        headers: { Authorization: `Bearer ${res.data.token}` }
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('isAdmin', adminRes.data.isAdmin.toString());
      if (adminRes.data.isAdmin) {
        navigate('/admin');
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Check if user has purchased a course
      const hasPurchasedCourse = res.data.courseName && res.data.payment_verified === "Payment Done";
      
      if (hasPurchasedCourse) {
        // User has purchased a course - save and go to Dashboard
        const loginData = {
          user: res.data.user,
          progress: res.data.progress,
          payment_verified: res.data.payment_verified,
          courseName: res.data.courseName,
          selectedDomain: res.data.selectedDomain,
        };

        localStorage.setItem(
          "prompt_master_data",
          JSON.stringify({
            profile: res.data.user,
            progress: res.data.progress,
            payment_verified: res.data.payment_verified,
            courseName: res.data.courseName,
            selectedDomain: res.data.selectedDomain,
          })
        );

        if (onLoginSuccess) {
          onLoginSuccess(loginData);
        }

        navigate("/course");
      } else {
        // User hasn't purchased course - DON'T save full data, just user info
        // This will cause App.tsx to show RegistrationForm (registration state)
        const loginData = {
          user: res.data.user,
          progress: res.data.progress || {},
        };

        localStorage.setItem(
          "prompt_master_data",
          JSON.stringify({
            profile: res.data.user,
            progress: res.data.progress || {},
          })
        );

        if (onLoginSuccess) {
          onLoginSuccess(loginData);
        }

        navigate("/course");
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* Title */}
        <div className="login-header">
          <h2>AIINSIGHT</h2>
          <p>Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>

          <div className="input-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-btn">
            Login
          </button>

        </form>

        <p className="footer-text">
          Don’t have an account?{" "}
          <Link to="/register">Register</Link>
        </p>

      </div>

      {/* CSS Inside Same File */}
      <style>{`

        .login-wrapper {
          min-height: 100vh;
          background: #0f0f0f;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .login-card {
          background: #1a1a1a;
          padding: 40px;
          border-radius: 16px;
          width: 100%;
          max-width: 420px;
          color: white;
          box-shadow: 0 15px 40px rgba(0,0,0,0.6);
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h2 {
          font-size: 24px;
          font-weight: 600;
        }

        .login-header p {
          color: #aaa;
          font-size: 14px;
          margin-top: 6px;
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
          .login-card {
            padding: 25px;
          }

          .login-header h2 {
            font-size: 20px;
          }
        }

      `}</style>

    </div>
  );
};

export default Userlogin;
