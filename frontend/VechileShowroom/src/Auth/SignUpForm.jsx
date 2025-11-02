import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validate = () => {
    const newErrors = { name: "", email: "", password: "", confirmPassword: "" };
    let ok = true;

    // Name
    if (!name) { newErrors.name = "Name is required"; ok = false; }
    else if (name.length < 2) { newErrors.name = "Name must be at least 2 characters"; ok = false; }

    // Email
    if (!email) { newErrors.email = "Email is required"; ok = false; }
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = "Invalid email format"; ok = false;
    }

    // Password
    if (!password) { newErrors.password = "Password is required"; ok = false; }
    else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"; ok = false;
    }

    // Confirm Password
    if (!confirmPassword) { newErrors.confirmPassword = "Confirm password is required"; ok = false; }
    else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match"; ok = false;
    }

    setErrors(newErrors);
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setErrorMessage("Please correct the errors below");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || "Signup completed. Please verify your email.");
        setErrorMessage("");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setErrorMessage(data.message || "Sign up failed");
      }
    } catch (error) {
      setErrorMessage(error.message || "Sign up failed");
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <div className="form-header">
          <h2 className="form-title">Sign Up</h2>
          <button className="cancel-btn" onClick={() => navigate("/")}>×</button>
        </div>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="form-content">
          {/* ----- Name ----- */}
          <div className="input-group">
            <label className="input-label">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Enter your name"
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          {/* ----- Email ----- */}
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          {/* ----- Password ----- */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          {/* ----- Confirm Password ----- */}
          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <div className="field-error">{errors.confirmPassword}</div>
            )}
          </div>

          <button type="submit" className="submit-button">Sign Up</button>

          {/* ----- Switch to Login ----- */}
          <div className="toggle-group">
            Already have an account?{" "}
            <a href="/login" className="toggle-link">Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}