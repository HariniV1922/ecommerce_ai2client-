import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, storage } from "../services/api";
import { ROUTES } from "../App.js";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const user = storage.getUser();
    if (user?.email) {
      navigate(ROUTES.HOME);
    }
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password required";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    
    setLoading(true);
    try {
      const data = await authAPI.login({
        email: form.email,
        password: form.password
      });
      
      storage.setToken(data.token);
      storage.setUser(data.user);
      navigate(ROUTES.HOME);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-bg">
        <div className="login-orb lo1" />
        <div className="login-orb lo2" />
        <div className="grid-lines" />
      </div>

      <div className="login-split">
        <div className="login-visual">
          <div className="visual-content">
            <div className="quote-mark">"</div>
            <p className="visual-quote">Where luxury meets convenience. Shop the world's finest, delivered to your door.</p>
            <div className="visual-badge">
              <span>✦</span> 50,000+ premium products
            </div>
          </div>
          <div className="floating-cards">
            <div className="fcard fc1">🛍 New Arrivals</div>
            <div className="fcard fc2">⭐ 4.9 Rated</div>
            <div className="fcard fc3">🚚 Free Shipping</div>
          </div>
        </div>

        <div className="login-form-side">
          <div className="login-card">
            <div className="login-brand">
              <span className="brand-icon">⬡</span>
              <span className="brand-name">LUXEMART</span>
            </div>

            <h1 className="login-title">Sign In</h1>
            <p className="login-sub">Access your premium account</p>

            {errors.submit && (
              <div className="error-banner" style={{color: '#e74c3c', marginBottom: '15px', textAlign: 'center'}}>
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? "input-err" : ""}
                />
                {errors.email && <span className="err-msg">{errors.email}</span>}
              </div>

              <div className="field-group">
                <label>Password</label>
                <div className="pass-wrap">
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    placeholder="Your password"
                    value={form.password}
                    onChange={handleChange}
                    className={errors.password ? "input-err" : ""}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && <span className="err-msg">{errors.password}</span>}
              </div>

              <div className="forgot-row">
                <span className="forgot-link">Forgot password?</span>
              </div>

              <button type="submit" className={`login-btn ${loading ? "loading" : ""}`} disabled={loading}>
                {loading ? <span className="spinner" /> : "Sign In →"}
              </button>
            </form>

            <div className="divider"><span>or</span></div>

            <p className="signup-link">
              New to LuxeMart?{" "}
              <span onClick={() => navigate(ROUTES.SIGNUP)}>Create Account</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}