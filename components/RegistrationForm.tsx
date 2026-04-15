import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";

interface Props {
  onComplete: (profile: UserProfile) => void;
  profile?: UserProfile | null;
  ondash: () => void;
}

const RegistrationForm = ({ onComplete, profile, ondash }: any) => {

  const navigate = useNavigate();

const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [citizen, setCitizen] = useState("");
  const [paymentVerified, setPaymentVerified] = useState("NO Payment");
  const [courseName, setCourseName] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [courseStatus, setCourseStatus] = useState("");
  const [expairy, setExpairy] = useState("");

  // Domain options
  const domainOptions = [
    { id: "content-writing", name: "Content Writing" },
    { id: "marketing", name: "Marketing & Ads" },
    { id: "coding", name: "Coding & Dev" },
    { id: "data-analysis", name: "Data Analysis" },
    { id: "education", name: "Education" },
    { id: "business", name: "Business" },
    { id: "fashion", name: "Fashion" },
    { id: "health", name: "Health" },
  ];

  const alreadyPurchased =
    status === "Payment Done" &&
    expairy &&
    new Date(expairy) >= new Date();

useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const response1 = await axios.get(
          `${API_BASE_URL}/my-course-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStatus(response1.data.payment_verified);
        setCourseStatus(response1.data.courseName);
        setExpairy(response1.data.courseexpairy);
        // Set selected domain if exists
        if (response1.data.selectedDomain) {
          setSelectedDomain(response1.data.selectedDomain);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFullname(user.fullName || "");
      setEmail(user.email || "");
    }
  }, []);

  useEffect(() => {
    if (!courseName) return setAmount(null);

    const fetchAmount = async () => {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/get-course-amount`,
          { courseName }
        );
        setAmount(res.data.amount);
        setDuration(res.data.duration);
      } catch (err) {
        setAmount(null);
        setDuration(null);
      }
    };

    fetchAmount();
  }, [courseName]);

const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!amount || !courseName) {
      alert("Please select a course package first!");
      return;
    }
    // For DomainCourse, require domain selection
    if (courseName === "DomainCourse" && !selectedDomain) {
      alert("Please select a domain first!");
      return;
    }
    startPayment();
  };

  const startPayment = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/test-razorpay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseName }),
      });

      const order = await res.json();

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "AIINSIGHT",
        description: "Course Enrollment",
        order_id: order.orderId,

        handler: async function (response: any) {
          const token = localStorage.getItem("token");
          
          const verifyRes = await fetch(
            `${API_BASE_URL}/verify-payment`,
            {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseName,
                selectedDomain: courseName === "DomainCourse" ? selectedDomain : null,
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            const expiry = new Date(
              Date.now() + duration * 24 * 60 * 60 * 1000
            );
            const expiryDate = expiry.toISOString().slice(0, 10);

            // verify-payment already saves to database, so we just need to update localStorage
            const user = {
              fullName: fullname,
              email,
              phone,
              citizen,
              paymentVerified: "Payment Done",
              courseName,
              selectedDomain: courseName === "DomainCourse" ? selectedDomain : null,
              amount,
              duration,
              courseexpairy: expiryDate,
            };

            // For DomainCourse, add the selected domain to purchasedDomains array
            const purchasedDomains = courseName === "DomainCourse" && selectedDomain 
              ? [selectedDomain] 
              : [];

            // Save to localStorage for immediate access
            const masterData = {
              profile: { fullName: fullname, email },
              progress: {},
              payment_verified: "Payment Done",
              courseName: courseName,
              selectedDomain: courseName === "DomainCourse" ? selectedDomain : null,
              purchasedDomains: purchasedDomains,
              courseexpairy: expiryDate,
              amount,
              duration
            };
            localStorage.setItem("prompt_master_data", JSON.stringify(masterData));

            alert("Payment successful! You can now access your course.");
            onComplete?.(user);
          } else {
            alert("Payment verification failed ❌");
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment failed");
    }
  };

  return (
    <div className="enroll-wrapper">
      <div className="enroll-card">

        {/* Header */}
        <div className="enroll-header">
          <h1>Professional Enrollment</h1>
          <p>Enroll in the advanced Prompt Engineering program.</p>
        </div>

        {/* Form */}
        <form className="enroll-form" onSubmit={handleSubmit}>

          <h3 className="section-title">
            Personal Information
          </h3>

          <div className="grid">
            <input required type="text" placeholder="Full Name"
              value={fullname} onChange={(e) => setFullname(e.target.value)} />

            <input required type="email" placeholder="Email"
              value={email} onChange={(e) => setEmail(e.target.value)} />

            <input required type="tel" placeholder="Phone Number"
              value={phone} onChange={(e) => setPhone(e.target.value)} />

            <select value={citizen}
              onChange={(e) => setCitizen(e.target.value)}>
              <option value="">Select Citizenship</option>
              <option value="International Learner">International Learner</option>
              <option value="Indian Citizen">Indian Citizen</option>
            </select>
          </div>

<select className="course-select"
            value={courseName}
            onChange={(e) => {
              setCourseName(e.target.value);
              // Reset domain when changing course
              if (e.target.value !== "DomainCourse") {
                setSelectedDomain("");
              }
            }}>
            <option value="">Choose Course Package</option>
            <option value="Beginner Level Course">
              Beginner Level Course - ₹49
            </option>
            <option value="DomainCourse">
              Domain Course (Select Domain Below) - ₹249
            </option>
            <option value="FullCourse">
              Full Course (All Access) - ₹499
            </option>
          </select>

          {/* Domain Selection - Only show when DomainCourse is selected */}
          {courseName === "DomainCourse" && (
            <div className="domain-select-wrapper" style={{ marginTop: "20px" }}>
              <label style={{ color: "#bbb", fontSize: "14px", marginBottom: "10px", display: "block" }}>
                Select Your Domain:
              </label>
              <select
                className="course-select"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                required
              >
                <option value="">Choose Domain</option>
                {domainOptions.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {alreadyPurchased ? (
            <button type="button" onClick={() => ondash()}
              className="primary-btn">
              Continue Learning
            </button>
          ) : (
            <button type="submit" className="primary-btn">
              {amount ? `PAY ₹${amount} & ENROLL` : "PAY & ENROLL"}
            </button>
          )}

          <p className="footer-note">
            Lifetime access • Secure Razorpay Checkout
          </p>

        </form>
      </div>

      {/* CSS */}
      <style>{`

        .enroll-wrapper {
          min-height: 100vh;
          background: #0f0f0f;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .enroll-card {
          background: #1a1a1a;
          border-radius: 20px;
          width: 100%;
          max-width: 800px;
          color: white;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
        }

        .enroll-header {
          background: #111;
          padding: 40px;
          text-align: center;
        }

        .enroll-header h1 {
          font-size: 28px;
          font-weight: 700;
        }

        .enroll-header p {
          color: #aaa;
          margin-top: 10px;
        }

        .enroll-form {
          padding: 40px;
        }

        .section-title {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 20px;
          color: #bbb;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        input, select {
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #333;
          background: #111;
          color: white;
          transition: 0.3s;
        }

        input:focus, select:focus {
          outline: none;
          border-color: #666;
        }

        .course-select {
          width: 100%;
          margin-top: 20px;
        }

        .primary-btn {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: none;
          background: white;
          color: black;
          font-weight: 600;
          margin-top: 30px;
          cursor: pointer;
          transition: 0.3s;
        }

        .primary-btn:hover {
          background: #e5e5e5;
        }

        .footer-note {
          text-align: center;
          font-size: 12px;
          color: #888;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .enroll-form {
            padding: 25px;
          }
        }

      `}</style>
    </div>
  );
};

export default RegistrationForm;
