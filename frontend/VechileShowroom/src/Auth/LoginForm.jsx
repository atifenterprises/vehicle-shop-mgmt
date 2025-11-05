import React, { useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

function LoginForm() {
  console.log('LoginForm');
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [MessageAfterSignUp, setMessageAfterSignUp] = useState('');
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };
    let isValid = true;

    // Email validation (required, valid format)
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    // Password validation (required, min 8 characters)
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Sign Up specific validations
    if (!isLogin) {
      // Name validation (required, min 2 characters)
      if (!name) {
        newErrors.name = 'Name is required';
        isValid = false;
      } else if (name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
        isValid = false;
      }

      // Confirm Password validation (required, must match password)
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirm password is required';
        isValid = false;
      } else if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setErrorMessage(isLogin ? 'Login failed: Please correct the errors below' : 'Sign Up failed: Please correct the errors below');
      return;
    }
    try {
      if (isLogin) {
        await login(email, password, name); // Use AuthContext's login method
        setErrors({ name: '', email: '', password: '', confirmPassword: '' });
        setSuccessMessage('Login successful!');
        navigate('/');
      } else {
        console.log('Sign Up:', { name, email, password });

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        });

        const result = await response.json();
        if (response.ok) {
          setErrorMessage('');
          setErrors({ name: '', email: '', password: '', confirmPassword: '' });
          // Toggle form mode and reset fields only for Sign Up
          setIsLogin(!isLogin);
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setName('');
          setSuccessMessage(result.message || 'Signup completed. Please verify your email.');
        } else {
          setErrorMessage(result.message || 'Sign Up failed');
        }
      }
    } catch (error) {
      setErrorMessage(isLogin ? 'Login failed: ' + error.message : 'Sign Up failed: ' + error.message);
    }
  }

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setErrorMessage('');
    setSuccessMessage('');
    setErrors({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="container">
      <div className="form-box">
        <h2 className="form-title">{isLogin ? 'Login' : 'Sign Up'}</h2>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        {MessageAfterSignUp && <div className="success-message">{MessageAfterSignUp}</div>}
        <form onSubmit={handleSubmit} className="form-content">
          {!isLogin && (
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
          )}
          <div className="input-group">
            {MessageAfterSignUp && <div className="error-message">{MessageAfterSignUp}</div>}
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
          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
            </div>
          )}
          {/* {isLogin && errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )} */}
          {isLogin && (
            <div className="link-group">
              <Link to="/forgot-password" className="link">
                Forgot Password?
              </Link>
            </div>
          )}
          <button type="submit" className="submit-button">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
          {/* <div className="toggle-group">
            <span>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" className="toggle-link" onClick={toggleForm}>
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
            </span>
          </div> */}
        </form>
      </div>
    </div>
  );
};


export default LoginForm;