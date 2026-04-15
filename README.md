<div align="center">
  <img width="1200" height="475" alt="PromptMaster Pro Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🚀 PromptMaster Pro

<p align="center">
  <a href="https://promptmaster-pro.com">
    <img src="https://img.shields.io/badge/Live_Demo-Visit_Website-FF6B35?style=for-the-badge" alt="Live Demo" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react" alt="React" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  </a>
</p>

> A comprehensive, multi-level Prompt Engineering educational platform featuring interactive learning, domain-specific courses, assessments, identity verification, and blockchain-ready digital certification.

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Getting Started](#-getting-started)
6. [Environment Variables](#-environment-variables)
7. [API Documentation](#-api-documentation)
8. [Course Structure](#-course-structure)
9. [Database Schema](#-database-schema)
10. [Payment Integration](#-payment-integration)
11. [Certificate System](#-certificate-system)
12. [Screenshots](#-screenshots)
13. [Contributing](#-contributing)
14. [License](#-license)

---

## 📖 Overview

**PromptMaster Pro** is a full-stack educational platform designed to teach prompt engineering across multiple domains and difficulty levels. The platform provides:

- 🎓 **Structured Learning Paths** - From beginner to advanced levels
- 🏢 **Domain-Specific Courses** - Content Writing, Marketing, Coding, Data Analysis, Education, Business, Fashion, Health
- ✅ **Interactive Assessments** - Practice questions and final tests
- 🔐 **Identity Verification** - Aadhaar-based verification for certification
- 📜 **Digital Certificates** - QR-verifiable certificates with unique IDs
- 💳 **Payment Integration** - Razorpay for course purchases
- 📊 **Progress Tracking** - Persistent learning progress across sessions

---

## ✨ Features

### User Features
| Feature | Description |
|---------|-------------|
| **User Registration** | Email-based registration with OTP verification |
| **Secure Login** | JWT-based authentication with bcrypt password hashing |
| **Course Enrollment** | Multiple course packages (Beginner, Domain, Full) |
| **Domain Selection** | Choose specialized domains after completing beginner level |
| **Learning Modules** | Video content, flashcards, and practice questions |
| **Identity Verification** | Aadhaar-based verification before final exam |
| **Final Assessments** | Comprehensive tests with 80% passing criteria |
| **Digital Certificates** | Downloadable PDF certificates with QR verification |
| **Progress Tracking** | Automatic progress saving and synchronization |
| **Course Expiry** | 365-day course access with countdown timer |

### Admin Features
| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview of users and course analytics |
| **Video Management** | Upload and manage course videos |
| **User Management** | View and manage registered users |
| **Certificate Verification** | Verify certificate authenticity |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.4 | UI Framework |
| TypeScript | 5.8.2 | Type Safety |
| Vite | 6.2.0 | Build Tool |
| React Router DOM | 7.13.0 | Navigation |
| React Toastify | 11.0.5 | Notifications |
| Lucide React | 0.563.0 | Icons |
| React Icons | 5.5.0 | Icon Library |
| QRCode React | 4.2.0 | QR Generation |
| React-PDF | 4.3.2 | PDF Generation |
| HTML2PDF.js | 0.14.0 | PDF Export |
| Axios | 1.13.5 | HTTP Client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest | Runtime |
| Express | 5.2.1 | Web Framework |
| MySQL | Latest | Database |
| JWT | Latest | Authentication |
| Bcrypt | Latest | Password Hashing |
| Razorpay | Latest | Payments |
| Nodemailer | Latest | Email Service |
| Dotenv | 17.2.3 | Environment Config |
| CORS | 2.8.6 | Cross-Origin |

---

## 📂 Project Structure

```
promptmaster-pro/
├── public/                      # Static assets
├── src/                        # React source code
│   ├── components/             # React components
│   │   ├── AadhaarVerification.tsx
│   │   ├── Admin.jsx
│   │   ├── Certificate.tsx
│   │   ├── CertificatePDF.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FinalTest.tsx
│   │   ├── Landing.jsx
│   │   ├── LearningModule.tsx
│   │   ├── Protectedroute.jsx
│   │   ├── Register.jsx
│   │   ├── RegistrationForm.tsx
│   │   ├── Userlogin.jsx
│   │   └── VerifyCertificate.tsx
│   ├── services/               # API services
│   ├── data/                   # Course data
│   ├── constants.ts            # Course content & questions
│   ├── types.ts                # TypeScript types
│   ├── additional.ts           # Additional utilities
│   ├── App.tsx                # Main application
│   └── index.tsx              # Entry point
├── Bbackend/                   # Express.js backend
│   ├── server.js               # Main server file
│   ├── model.js                # User model
│   ├── test-db.js              # Database connection
│   ├── userprogressmodel.js    # Progress model
│   ├── registermodel.js        # Registration model
│   ├── payment_log.js          # Payment logging
│   ├── coursepricemodel.js     # Course pricing
│   └── videomodel.js           # Video management
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite config
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/promptmaster-pro.git
   cd promptmaster-pro
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=7000
   
   # JWT Secret (generate a strong random string)
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=cert_db
   
   # Razorpay Configuration
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Email Configuration (for OTP)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Set up the database**
   
   The application will automatically create the required tables on first run. For manual setup:
   ```sql
   CREATE DATABASE cert_db;
   USE cert_db;
   
   -- Tables will be created by the backend
   ```

5. **Start the backend server**
   ```bash
   cd Bbackend
   npm install
   node server.js
   ```
   
   Backend will run on `http://localhost:7000`

6. **Start the frontend development server**
   ```bash
   # In a new terminal
   npm run dev
   ```
   
   Frontend will run on `http://localhost:5173`

### Build for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes (default: 7000) |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `DB_HOST` | MySQL database host | Yes |
| `DB_USER` | MySQL username | Yes |
| `DB_PASSWORD` | MySQL password | Yes |
| `DB_NAME` | Database name | Yes |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | Yes |
| `EMAIL_USER` | Gmail address for OTP | Yes |
| `EMAIL_PASS` | Gmail App Password | Yes |

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/user-login` | User login |
| POST | `/send-otp` | Send OTP for verification |
| POST | `/verify-otp` | Verify OTP |

### Course Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register-user` | Register for a course |
| GET | `/my-course-status` | Get course status |
| POST | `/get-course-amount` | Get course price |
| POST | `/test-razorpay` | Create Razorpay order |
| POST | `/verify-payment` | Verify course payment |

### Progress Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/save-progress` | Save user progress |
| POST | `/get-progress` | Get user progress |
| GET | `/get-purchased-domains` | Get purchased domains |

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/verify-domain-payment` | Verify domain purchase |
| POST | `/generate-certificate` | Generate certificate |

### Certificate Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/verify` | Verify certificate |
| POST | `/update-certificate-name` | Update certificate name |

### Video Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/store-video` | Store video URL |
| GET | `/view-videos` | Get all videos |

---

## 📚 Course Structure

### Level 1: Beginner Level
- Introduction to Prompt Engineering
- Zero-shot, One-shot, Few-shot prompting
- Chain-of-Thought reasoning
- Token optimization
- Output formatting

### Level 2: Domain-Specific
After completing Beginner level, users can choose from:

| Domain | Description |
|--------|-------------|
| Content Writing | Blog posts, articles, copywriting |
| Marketing | Ads, social media, email campaigns |
| Coding | Code generation, debugging, documentation |
| Data Analysis | Data insights, visualizations |
| Education | Lesson plans, assessments |
| Business | Reports, strategies, presentations |
| Fashion | Product descriptions, trends |
| Health | Medical content, patient education |

### Level 3: Advanced
- Complex multi-step prompts
- Multi-modal prompting
- Agent-based workflows
- Industry-specific optimizations

---

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  citizen VARCHAR(50),
  payment_verified VARCHAR(50),
  courseName VARCHAR(255),
  selected_domain VARCHAR(255),
  purchased_domains TEXT,
  amount DECIMAL(10,2),
  duration INT,
  courseexpairy DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Progress Table
```sql
CREATE TABLE user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  currentLevelId VARCHAR(50),
  completedLevels JSON,
  certifications JSON
);
```

### Certificates Table
```sql
CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  certificate_id VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  course VARCHAR(255),
  issue_date DATE
);
```

### Courses Table
```sql
CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(255),
  amount DECIMAL(10,2),
  duration INT
);
```

### Videos Table
```sql
CREATE TABLE videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  video VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💳 Payment Integration

The platform uses **Razorpay** for payment processing:

### Course Packages

| Package | Price (₹) | Duration |
|---------|-----------|----------|
| Beginner Level | ₹49 | 30 days |
| Domain Course | ₹249 | 30 days |
| Full Course | ₹499 | 90 days |

### Payment Flow

1. User selects course package
2. Frontend requests order from backend
3. Backend creates Razorpay order
4. User completes payment on Razorpay
5. Frontend verifies payment signature
6. Backend confirms and activates course

---

## 📜 Certificate System

### Certificate Features
- Unique Certificate ID (format: `PM-{LEVEL}-{RANDOM}`)
- QR Code for instant verification
- PDF download with professional template
- Blockchain-ready design

### Certificate Verification
```
Website: /verify
API: GET /verify?certId=CERTIFICATE_ID
```

### Certificate Data Structure
```typescript
interface Certificate {
  id: string;           // PM-BEGINNER-ABCD
  levelName: string;    // "Prompt Engineering Beginner"
  date: string;         // DD/MM/YYYY
  learnerName: string;  // User's full name
}
```

---

## 📸 Screenshots

> *(Add your project screenshots here)*

| Landing Page | Dashboard |
|--------------|-----------|
| ![Landing](link-to-screenshot) | ![-screenshot) |

| Learning Module |Dashboard](link-to Certificate |
|-----------------|-------------|
| ![Learning](link-to-screenshot) | ![Certificate](link-to-screenshot) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Live Website**: [https://promptmaster-pro.com](https://promptmaster-pro.com)
- **Documentation**: [https://docs.promptmaster-pro.com](https://docs.promptmaster-pro.com)
- **Support**: support@promptmaster-pro.com

---

<div align="center">
  <p>Built with ❤️ using React, Node.js, and MySQL</p>
  <p>© 2024 PromptMaster Pro Academy. All rights reserved.</p>
</div>

---

## 🚀 Quick Start Commands

```bash
# Install all dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start backend (separate terminal)
cd Bbackend && node server.js
```

---

*This README was generated for PromptMaster Pro v1.0.0*

