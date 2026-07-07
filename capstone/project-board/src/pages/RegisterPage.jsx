import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_BASE_URL, BOARD_BASE_URL } from "../config";
import { request } from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [teamId, setTeamId] = useState("");
  const [role, setRole] = useState("");
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successName, setSuccessName] = useState("");

  useEffect(() => {
    async function loadTeams() {
      setLoadingTeams(true);
      try {
        const data = await request("GET", `${BOARD_BASE_URL}/teams`);
        setTeams(data || []);
        if (data && data.length > 0) setTeamId(data[0].id);
      } catch (err) {
        setApiError(err.message || "Failed to load teams");
      } finally {
        setLoadingTeams(false);
      }
    }
    loadTeams();
  }, []);

  function validate() {
    const e = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!confirm) e.confirm = "Please confirm your password";
    else if (password !== confirm) e.confirm = "Passwords do not match";
    if (!teamId) e.teamId = "Please select a team";
    if (!role.trim()) e.role = "Role is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    setSuccessName("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const body = { name: name.trim(), email: email.trim(), password, teamId, role: role.trim() };
      const data = await request("POST", `${AUTH_BASE_URL}/auth/register`, body);
      setSuccessName(data?.user?.name || data?.name || name.trim());
      // Optionally navigate to login after short delay
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (err) {
      setApiError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h1>Create account</h1>
        <p className="login-subtitle">Register a new team member account</p>
        {apiError && <p className="error">{apiError}</p>}
        {successName && <p style={{ color: "green", marginBottom: 12 }}>Account created for {successName}</p>}

        <label>
          Full name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          {errors.name && <p className="error">{errors.name}</p>}
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {errors.email && <p className="error">{errors.email}</p>}
        </label>

        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {errors.password && <p className="error">{errors.password}</p>}
        </label>

        <label>
          Confirm password
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          {errors.confirm && <p className="error">{errors.confirm}</p>}
        </label>

        <label>
          Team
          <select value={teamId} onChange={(e) => setTeamId(e.target.value)} disabled={loadingTeams}>
            {loadingTeams && <option>Loading teams…</option>}
            {!loadingTeams && teams.length === 0 && <option value="">No teams available</option>}
            {!loadingTeams && teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {errors.teamId && <p className="error">{errors.teamId}</p>}
        </label>

        <label>
          Role
          <input value={role} onChange={(e) => setRole(e.target.value)} required />
          {errors.role && <p className="error">{errors.role}</p>}
        </label>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Creating…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
