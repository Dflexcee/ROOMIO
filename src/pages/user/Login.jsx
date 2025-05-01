import React, { useState } from "react";
import { loginWithEmail } from "../../services/authService"
import PageWrapper from "../../components/common/PageWrapper"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async () => {
    const { user, error } = await loginWithEmail(email, password)
    if (error) setError(error.message)
    else alert("Welcome! Logged in successfully.")
  }

  return (
    <PageWrapper>
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        className="border border-gray-300 p-2 rounded w-full mb-2"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        className="border border-gray-300 p-2 rounded w-full mb-4"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Login
      </button>
    </PageWrapper>
  )
} 