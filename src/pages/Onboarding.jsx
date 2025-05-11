import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "../components/common/DarkModeToggle";

const slides = [
  {
    title: "🏡 Find Safe, Affordable Housing",
    description: "Browse verified listings and roommates across campuses in Nigeria.",
    illustration: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2">
        <rect x="10" y="35" width="60" height="35" rx="8" fill="#3b82f6"/>
        <rect x="25" y="50" width="30" height="20" rx="4" fill="#fff"/>
        <polygon points="40,15 10,35 70,35" fill="#60a5fa"/>
        <rect x="35" y="60" width="10" height="10" rx="2" fill="#3b82f6"/>
      </svg>
    ),
  },
  {
    title: "🤝 Match With Trusted Roommates",
    description: "Filter by budget, lifestyle, school, and more — find your perfect match.",
    illustration: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2">
        <circle cx="26" cy="34" r="12" fill="#3b82f6"/>
        <circle cx="54" cy="34" r="12" fill="#60a5fa"/>
        <rect x="18" y="50" width="44" height="18" rx="9" fill="#3b82f6"/>
        <rect x="30" y="60" width="20" height="8" rx="4" fill="#fff"/>
      </svg>
    ),
  },
  {
    title: "✅ Verified Listings. Scam Alerts.",
    description: "Every post is reviewed. Stay safe with alerts, reviews, and ID checks.",
    illustration: (
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2">
        <circle cx="40" cy="40" r="32" fill="#3b82f6"/>
        <path d="M28 42l8 8 16-16" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="20" y="60" width="40" height="8" rx="4" fill="#60a5fa"/>
      </svg>
    ),
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      navigate("/signup-login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
      <div className="flex justify-center pt-4">
        <DarkModeToggle />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center animate-fade-in border border-blue-100 dark:border-gray-800">
          {slides[index].illustration}
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300">
            {slides[index].title}
          </h2>
          <p className="text-gray-700 dark:text-gray-200 mb-6 text-lg md:text-xl transition-all duration-300">
            {slides[index].description}
          </p>
          <button
            onClick={next}
            className="bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:from-pink-600 hover:to-yellow-600 dark:hover:from-blue-800 dark:hover:to-purple-800 transition-all text-lg font-semibold"
          >
            {index < slides.length - 1 ? "Next" : "Get Started"}
          </button>
        </div>

        <div className="flex gap-2 mt-8">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full transition-all duration-300 shadow-sm ${
                i === index ? "bg-pink-500 dark:bg-blue-500 scale-125" : "bg-gray-300 dark:bg-gray-700"
              }`}
            ></span>
          ))}
        </div>
        <div className="mt-10 text-gray-400 dark:text-gray-500 text-xs tracking-wide">
          &copy; {new Date().getFullYear()} CampusMate. All rights reserved.
        </div>
      </div>
    </div>
  );
} 