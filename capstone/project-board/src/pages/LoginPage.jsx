import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import logo from '../assets/connect-logo.png'; 
export default function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <button type="button" className="login-theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "Dark mode" : "Light mode"}
      </button>
      <div className="login-logo-mark" aria-hidden="true">
        <img src={logo} alt="EverBank Connect Logo" width="130" height="130" />
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>EverBank Connect</h1>
        <p className="login-subtitle">Sign in to your team board</p>
        {error && <p className="error">{error}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <div className="login-footer-link">
          <small>
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </small>
        </div>
      </form>
    </div>
  );
}
