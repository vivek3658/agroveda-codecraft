import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginUser, registerUser, handleGoogleAuthResponse } from "./authService";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    role: "farmer",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    captchaInput: "",
  });

  const generateCaptcha = () => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setCaptcha(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, [isLogin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setErrorMessage("Email and password are required.");
      return false;
    }

    if (formData.captchaInput !== captcha) {
      setErrorMessage("Invalid captcha. Please try again.");
      generateCaptcha();
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setErrorMessage("Name is required.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const response = await loginUser(
          formData.email,
          formData.password,
          formData.role,
          formData.captchaInput
        );
        login(response);
        navigate("/dashboard");
      } else {
        await registerUser(formData);
        setErrorMessage("");
        alert("Registration successful. Please login.");
        setIsLogin(true);
        setFormData({
          role: "farmer",
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          captchaInput: "",
        });
      }
    } catch (err) {
      setErrorMessage(err.message || "Request failed. Please try again.");
      console.error("Auth Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = (response) => {
    if (!response?.credential) {
      setErrorMessage("Google login did not return a credential. Please try again.");
      return;
    }

    setLoading(true);

    handleGoogleAuthResponse(response.credential, formData.role)
      .then((data) => {
        login(data);
        navigate("/dashboard");
      })
      .catch((err) => {
        setErrorMessage("Google login error: " + (err.message || "Authentication failed"));
        setLoading(false);
      });
  };

  return (
    <div className="auth-shell">
      <section className="auth-showcase">
        <div className="auth-showcase-badge">AgroVeda</div>
        <h1>Grow smarter with a cleaner digital farming workflow.</h1>
        <p>
          Manage crops, explore the marketplace, access learning resources, and keep every
          farming decision in one calm green workspace.
        </p>

        <div className="auth-benefits">
          <div className="auth-benefit-card">
            <strong>Farmer-first workflow</strong>
            <span>Crop tracking, analytics, storage support, and sponsored recommendations.</span>
          </div>
          <div className="auth-benefit-card">
            <strong>Market access</strong>
            <span>Buy and sell through a simple marketplace with orders and invoice history.</span>
          </div>
          <div className="auth-benefit-card">
            <strong>Learning support</strong>
            <span>Courses, YouTube study paths, and practical farming resources built into the app.</span>
          </div>
        </div>
      </section>

      <section className="auth-container">
        {loading && <div className="loader-overlay">Connecting to server...</div>}

        <div className="auth-header">
          <p className="auth-kicker">{isLogin ? "Welcome back" : "Create your account"}</p>
          <h2>{isLogin ? "Login to AgroVeda" : "Join AgroVeda"}</h2>
          <p>
            {isLogin
              ? "Access your farm operations, marketplace activity, and services."
              : "Register your smart agriculture account and get started in minutes."}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            type="button"
            className={`tab-btn ${!isLogin ? "active" : ""}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {errorMessage && <div className="error-box">{errorMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Identity Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="farmer">Farmer</option>
              <option value="consumer">Consumer</option>
            </select>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Verify Captcha</label>
            <div className="captcha-row">
              <span className="captcha-code">{captcha}</span>
              <input
                type="text"
                name="captchaInput"
                placeholder="Enter captcha"
                value={formData.captchaInput}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {isLogin ? "Enter Dashboard" : "Create Account"}
          </button>
        </form>

        <div className="divider">
          <span>OR CONTINUE WITH GOOGLE</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => {
              setErrorMessage(
                "Google login blocked. Ensure 'http://localhost:5173' is added to Authorized JavaScript origins."
              );
            }}
            useOneTap
            theme="filled_blue"
            shape="pill"
            text="continue_with"
          />
        </div>

        <p className="auth-switch-text">
          {isLogin ? "New to AgroVeda?" : "Already a member?"}
          <span className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? " Sign up now" : " Back to login"}
          </span>
        </p>
      </section>
    </div>
  );
};

export default Auth;
