import React from "react";
import "./dashbord.css";
import { useNavigate } from "react-router-dom";

import img1 from "./assets/prompt-engineering.png";
import img2 from "./assets/prompt.jpg";
import img3 from "./assets/prompt2.jpg";
import img4 from "./assets/prompt3.jpg";
import logo from "./assets/logo2.png";

const Landing = () => {

  const navigate = useNavigate();

  const registerto = () => navigate("/register");
  const loginto = () => navigate("/login");

  return (
    <div id="background" className="relative min-h-screen overflow-hidden text-white">

      {/* Background Slides */}
      <div className="slide" style={{ backgroundImage: `url(${img1})` }}></div>
      <div className="slide" style={{ backgroundImage: `url(${img2})` }}></div>
      <div className="slide" style={{ backgroundImage: `url(${img3})` }}></div>
      <div className="slide" style={{ backgroundImage: `url(${img4})` }}></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center min-h-screen px-6">

        {/* Logo */}
        <img
          src={logo}
          alt="AIINSIGHT"
          className="w-[320px] sm:w-[380px] md:w-[460px] lg:w-[560px] mb-6"
        />

        {/* Tagline */}
        <p className="text-gray-300 max-w-xl md:max-w-2xl text-sm sm:text-base md:text-lg mb-8 leading-relaxed">
          Learn AI communication, build domain expertise and unlock advanced
          automation techniques to transform your career.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mb-10 flex-wrap justify-center">

          <button
            onClick={registerto}
            className="px-6 py-3 text-base font-semibold rounded-lg bg-white text-black hover:bg-gray-200 transition duration-300"
          >
            Register
          </button>

          <button
            onClick={loginto}
            className="px-6 py-3 text-base font-medium rounded-lg border border-white bg-transparent hover:bg-white hover:text-black transition duration-300"
          >
            Login
          </button>

        </div>

       
        

      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-20 py-4 text-center text-gray-400 text-sm bg-gradient-to-t from-black/80 to-transparent">
        © 2024 AIINSIGHT • Empowering AI Learning
      </div>

    </div>
  );
};

export default Landing;