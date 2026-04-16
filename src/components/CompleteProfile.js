'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import '../styles/login-form.css'
import api from "../services/api"

export default function CompleteProfile() {

  // ================= UI STATE =================
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // ================= FORM STATE =================
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // ================= COMPLETE PROFILE =================
  const handleCompleteProfile = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("access")

      await api.post(
        "complete-profile/",
        {
          username,
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      alert("Profil complété avec succès")

      // redirection login ou dashboard
      window.location.href = "/"

    } catch (err) {
      console.error(err)
      alert("Erreur lors de la mise à jour du profil")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">

      {/* LEFT SIDE (même design) */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="logo-section">
            <div className="logo-box">
              <div className="logo-inner"></div>
            </div>
            <h1 className="logo-text">Student life and services</h1>
          </div>

          <div className="hero-section">
            <h2 className="hero-title">Complete your profile</h2>
            <p className="hero-description">
              Set your username and password to continue.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="form-wrapper">

          <div className="form-content">

            {/* HEADER */}
            <div className="form-header">
              <h2 className="form-title">Complete Profile</h2>
              <p className="form-subtitle">
                Finish setting up your account
              </p>
            </div>

            {/* USERNAME */}
            <div className="form-fields">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="form-input"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                />
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label className="form-label">New Password</label>

                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="form-input"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <button
              className="btn-primary"
              onClick={handleCompleteProfile}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}