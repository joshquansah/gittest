import { useEffect, useState } from "react";
import { AI_BASE_URL, BOARD_BASE_URL } from "../config";
import { request } from "../api";

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

const EMPTY_DRAFT = {
  title: "",
  description: "",
  dueDate: "",
  teamId: "",
  status: "PLANNED",
};

export default function AIDrawer({ open, onClose, onProjectCreated, user }) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [aiInput, setAiInput] = useState("");
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [aiError, setAiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadTeams() {
      setLoadingTeams(true);
      try {
        const data = await request("GET", `${BOARD_BASE_URL}/teams`);
        if (!active) return;
        setTeams(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setTeamError(err.message || "Failed to load teams");
      } finally {
        if (active) setLoadingTeams(false);
      }
    }

    setDraft({
      ...EMPTY_DRAFT,
      teamId: String(user?.team?.id ?? ""),
    });
    setAiInput("");
    setTeams([]);
    setTeamError("");
    setCreateError("");
    setAiError("");
    setSuccessMessage("");

    loadTeams();

    function onKey(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => {
      active = false;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, user]);

  if (!open) return null;

  function handleChange(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function applyAiAssist() {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiError("");
    setCreateError("");
    try {
      const data = await request("POST", `${AI_BASE_URL}/ai/parse`, { input: aiInput });
      const generatedProject = data || {};
      setDraft((current) => ({
        ...current,
        title: generatedProject.title || current.title,
        description: generatedProject.description || current.description,
        dueDate: toDateInputValue(generatedProject.dueDate || current.dueDate),
        teamId: draft.teamId || undefined,
        ownerId: user?.id ?? undefined,
      }));
      setSuccessMessage("AI suggestions applied to the form.");
    } catch (err) {
      setAiError(err.message || "AI assist failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setCreateError("");
    setAiError("");
    setSuccessMessage("");
    try {
      const payload = {
        title: draft.title.trim(),
        name: draft.title.trim(),
        description: draft.description.trim() || undefined,
        dueDate: draft.dueDate || undefined,
        teamId: draft.teamId || undefined,
        ownerId: user?.id ?? undefined,
        status: draft.status || "PLANNED",
      };
      const data = await request("POST", `${BOARD_BASE_URL}/projects`, payload);
      const createdProject = data?.project || data?.createdProject || data?.created || data;
      onProjectCreated?.(createdProject);
      handleClose();
    } catch (err) {
      setCreateError(err.message || "Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setDraft(EMPTY_DRAFT);
    setAiInput("");
    setTeams([]);
    setTeamError("");
    setCreateError("");
    setAiError("");
    setSuccessMessage("");
    onClose();
  }

  return (
    <>
      <div className="drawer-overlay" onClick={handleClose} />
      <aside className="ai-drawer">
        <button type="button" className="drawer-close" onClick={handleClose} aria-label="Close">
          ×
        </button>

        <form className="drawer-form" onSubmit={handleSubmit}>
          <div className="drawer-section">
            <div>
              <h2>Create project</h2>
              <p>Build it by hand first. Use AI only if you want it to fill in the blanks.</p>
            </div>

            <label className="drawer-field">
              <span>Title</span>
              <input value={draft.title} onChange={(event) => handleChange("title", event.target.value)} placeholder="Project title" required />
            </label>

            <label className="drawer-field">
              <span>Description</span>
              <textarea
                value={draft.description}
                onChange={(event) => handleChange("description", event.target.value)}
                placeholder="What is this project for?"
                rows={5}
              />
            </label>

            <div className="drawer-grid">
              <label className="drawer-field">
                <span>Due date</span>
                <input type="date" value={draft.dueDate} onChange={(event) => handleChange("dueDate", event.target.value)} />
              </label>

              <label className="drawer-field">
                <span>Team</span>
                <select value={draft.teamId} onChange={(event) => handleChange("teamId", event.target.value)} disabled={loadingTeams}>
                  <option value="">No team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {teamError && <p className="error">{teamError}</p>}
          </div>

          <div className="drawer-section drawer-section-optional">
            <div>
              <h2>Optional AI assist</h2>
              <p>Paste a note, email, or rough idea and let AI prefill the project form.</p>
            </div>

            <label className="drawer-field">
              <span>AI prompt</span>
              <textarea
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                placeholder="Paste a message, spec, or rough brief here."
                rows={7}
              />
            </label>

            <div className="drawer-actions">
              <button type="button" className="btn-ghost" onClick={applyAiAssist} disabled={aiLoading || !aiInput.trim()}>
                {aiLoading ? "Applying…" : "Use AI to fill form"}
              </button>
            </div>

            {aiError && <p className="error">{aiError}</p>}
            {successMessage && <p className="success">{successMessage}</p>}
          </div>

          {createError && <p className="error">{createError}</p>}

          <div className="drawer-actions drawer-actions-final">
            <button type="button" className="btn-ghost" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving || !draft.title.trim()}>
              {saving ? "Creating…" : "Create project"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
