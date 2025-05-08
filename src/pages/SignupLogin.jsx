import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import DarkModeToggle from "../components/common/DarkModeToggle";

export default function SignupLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = async () => {
    setLoading(true);
    setError("");

    let result;
    if (isLogin) {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      navigate("/profile-setup");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors px-4">
      <div className="absolute top-6 right-8">
        <DarkModeToggle />
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-blue-100 dark:border-gray-800 animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-blue-700 dark:text-pink-400 drop-shadow-sm transition-all duration-300">
          {isLogin ? "Login" : "Create an Account"}
        </h2>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4 rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          className="bg-gradient-to-r from-pink-500 to-yellow-500 dark:from-blue-700 dark:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:from-pink-600 hover:to-yellow-600 dark:hover:from-blue-800 dark:hover:to-purple-800 transition-all text-lg font-semibold w-full mb-2 disabled:opacity-60"
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 dark:text-pink-400 font-medium hover:underline"
          >
            {isLogin ? "Create account" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
} 