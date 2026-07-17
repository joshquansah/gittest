import { useEffect, useState } from "react";
import { AI_BASE_URL } from "../config";
import { request } from "../api";

export default function AIDrawer({ open, onClose, onProjectCreated }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await request("POST", `${AI_BASE_URL}/ai/parse`, { input });
      const createdProject = data?.createdProject || data?.project || data?.created || data;
      setCreated(createdProject);
      onProjectCreated?.(createdProject);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setInput("");
    setCreated(null);
    setError("");
    onClose();
  }

  return (
    <>
      <div className="drawer-overlay" onClick={handleClose} />
      <aside className="ai-drawer">
        <button
          type="button"
          className="drawer-close"
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>

        {!created ? (
          <form className="drawer-form" onSubmit={handleSubmit}>
            <h2>Create projects with AI</h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste anything. An email, a Slack message, a sentence. The AI will create a project with nested tasks."
              rows={12}
            />
            {error && <p className="error">{error}</p>}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !input.trim()}
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </form>
        ) : (
          <div className="confirmation">
            <h2>Created project</h2>
            <p className="confirmation-project-title">{created.title || created.name || "Untitled project"}</p>
            <ul className="confirmation-list">
              {(created.tasks || []).map((t) => (
                <li
                  key={t.id}
                  className={t.ownerResolved === false ? "needs-owner" : ""}
                >
                  <strong>{t.title}</strong>
                  <span>
                    {t.status}
                    {t.projectName ? ` · ${t.projectName}` : ""}
                    {t.owner ? ` · ${t.owner}` : ""}
                  </span>
                  {t.ownerResolved === false && (
                    <span className="needs-owner-label">Needs owner</span>
                  )}
                </li>
              ))}
            </ul>
            <button type="button" className="btn-primary" onClick={handleClose}>
              Done
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
