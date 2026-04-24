'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import '../styles/login-form.css'
import api from "../services/api"
import { useNavigate } from "react-router-dom"

export default function LoginForm() {

  // --- NAVIGATION ---
  const navigate = useNavigate()

  // --- ÉTATS DE L'INTERFACE (UI) ---
  const [showPassword, setShowPassword] = useState(false)
  const [currentView, setCurrentView] = useState('login')

  // --- ÉTATS DES DONNÉES (AUTH) ---
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // ==========================================
  // 1. INSCRIPTION
  // ==========================================
  const handleRegister = async () => {
    try {
      await api.post("register/", { email })

      alert("Demande envoyée ! Attendez validation admin.")
      setCurrentView("login")

    } catch (err) {
      console.error(err)
      alert("Erreur lors de la création du compte.")
    }
  }

  // ==========================================
  // 2. CONNEXION (CORRIGÉE)
  // ==========================================

  const handleLogin = async () => {
  try {
    const res = await api.post("token/", {
      email,
      password,
    })

    localStorage.setItem("access", res.data.access)
    localStorage.setItem("refresh", res.data.refresh)

    const mustChange = res.data.must_change_password
    const hasUsername = res.data.has_username ?? false
    const role = res.data.role

    // 🔥 DEBUG
    console.log("LOGIN RESPONSE :", res.data)
    console.log("ROLE =", role)
    console.log("mustChange =", mustChange)
    console.log("hasUsername =", hasUsername)

    if (mustChange || !hasUsername) {
      navigate("/complete-profile")
    } else {
      if (role === "admin") {
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
    }

  } catch (err) {
    console.error(err)
    alert("Erreur login : email ou mot de passe incorrect.")
  }
}

  // ==========================================
  // 3. CHANGEMENT DE MOT DE PASSE (optionnel si gardé)
  // ==========================================
  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem("access")

      await api.post(
        "change-password/",
        { password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      alert("Mot de passe mis à jour !")

      setCurrentView("login")

    } catch (err) {
      console.error(err)
      alert("Erreur lors du changement de mot de passe.")
    }
  }

  return (
    <div className="login-container">

      {/* LEFT */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="logo-section">
            <div className="logo-box">
              <div className="logo-inner"></div>
            </div>
            <h1 className="logo-text">Student life and services</h1>
          </div>

          <div className="hero-section">
            <h2 className="hero-title">University management.</h2>
            <p className="hero-description">
              Login to access your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="form-wrapper">

          {/* LOGIN */}
          {currentView === 'login' && (
            <div className="form-content">

              <div className="form-header">
                <h2 className="form-title">Welcome Back</h2>
                <p className="form-subtitle">Login to continue</p>
              </div>

              <div className="form-fields">

                <input
                  type="email"
                  placeholder="Email"
                  className="form-input"
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {password && (
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>

              </div>

              <button className="btn-primary" onClick={handleLogin}>
                Log In
              </button>

              <button
                className="btn-secondary"
                onClick={() => setCurrentView("register")}
              >
                Create Account
              </button>

            </div>
          )}

          {/* REGISTER */}
          {currentView === 'register' && (
            <div className="form-content">

              <div className="form-header">
                <h2 className="form-title">Create Account</h2>
                <p className="form-subtitle">Enter your email</p>
              </div>

              <div className="form-fields">
                <input
                  type="email"
                  placeholder="Email"
                  className="form-input"
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <button className="btn-primary" onClick={handleRegister}>
                Send Request
              </button>

              <button
                className="btn-secondary"
                onClick={() => setCurrentView("login")}
              >
                Back to Login
              </button>

            </div>
          )}

          {/* CHANGE PASSWORD (optionnel - peut être supprimé si tu utilises /complete-profile) */}
          {currentView === 'changePassword' && (
            <div className="form-content">

              <div className="form-header">
                <h2 className="form-title">New Password</h2>
                <p className="form-subtitle">Choose a secure password</p>
              </div>

              <div className="form-fields">
                <input
                  type="password"
                  placeholder="New password"
                  className="form-input"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <button className="btn-primary" onClick={handleChangePassword}>
                Save Password
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}