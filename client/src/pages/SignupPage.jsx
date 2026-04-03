import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { ROUTES } from "../App.js";
import "./SignupPage.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "Enter valid 10-digit number";
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
      await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone
      });
      
      navigate(ROUTES.LOGIN);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-root">
      <div className="signup-bg">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
      </div>

      <div className="signup-card">
        <div className="signup-brand">
          <span className="brand-icon">⬡</span>
          <span className="brand-name">LUXEMART</span>
        </div>
        <h1 className="signup-title">Create Account</h1>
        <p className="signup-sub">Join the premium shopping experience</p>

        {errors.submit && (
          <div className="error-banner" style={{color: '#e74c3c', marginBottom: '15px', textAlign: 'center'}}>
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {[
            { label: "Full Name", name: "name", type: "text", placeholder: "John Doe" },
            { label: "Email Address", name: "email", type: "email", placeholder: "you@email.com" },
            { label: "Phone Number", name: "phone", type: "tel", placeholder: "10-digit number" },
          ].map((field) => (
            <div className="field-group" key={field.name}>
              <label>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
                className={errors[field.name] ? "input-err" : ""}
              />
              {errors[field.name] && <span className="err-msg">{errors[field.name]}</span>}
            </div>
          ))}

          <div className="field-group">
            <label>Password</label>
            <div className="pass-wrap">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                placeholder="Min 6 characters"
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

          <div className="field-group">
            <label>Confirm Password</label>
            <div className="pass-wrap">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-err" : ""}
              />
              <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? "🙈" : "👁"}
              </button>
            </div>
            {errors.confirmPassword && <span className="err-msg">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className={`signup-btn ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? <span className="spinner" /> : "Create Account →"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate(ROUTES.LOGIN)}>Sign In</span>
        </p>
      </div>
    </div>
  );
}