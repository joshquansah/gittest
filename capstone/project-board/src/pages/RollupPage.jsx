import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { request } from "../api";
import { BOARD_BASE_URL } from "../config";
import logo from '../assets/connect-logo.png'; 
const SIDEBAR_LINKS = [
  { to: "/", label: "Projects" },
  { to: "/rollup", label: "Rollup" },
  { to: "/profile", label: "Profile" },
];
const ROLE_LABEL = {
  EXECUTIVE: "Executive",
  TEAM_MANAGER: "Team Manager",
  TEAM_MEMBER: "Team Member",
};
const ROLE_ORDER = { EXECUTIVE: 0, TEAM_MANAGER: 1, TEAM_MEMBER: 2 };
function getUserDisplayName(user) {
  return user?.username || "User";
}

function getUserDepartmentName(user) {
  return (
    user?.team?.department || "—"
  );
}

function getUserAvatarUrl(user) {
  return user?.photoUrl || null;
}

function getInitials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Sidebar({ user }) {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
            <img src={logo} alt="EverBank Connect Logo" width="50" height="50" />
        </div>
        <div>
          <strong>EverBank Connect</strong>
          <span>Internal delivery space</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {SIDEBAR_LINKS.map((link) => {
          const isActive =
            link.to === "/"
              ? location.pathname === "/"
              : location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);

          return (
            <Link key={link.to} to={link.to} className={`sidebar-link ${isActive ? "is-active" : ""}`}>
              <span className="sidebar-link-dot" aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar user-avatar-large">
          {getUserAvatarUrl(user) ? <img src={getUserAvatarUrl(user)} alt="" /> : getInitials(getUserDisplayName(user))}
        </div>
        <div>
          <strong>{getUserDisplayName(user)}</strong>
          <span>{getUserDepartmentName(user)}</span>
        </div>
      </div>
    </aside>
  );
}

/* ── User popup ── */
function UserPopup({ member, onClose }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
 
  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.18)",
          zIndex: 100,
        }}
        onClick={onClose}
      />
 
      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 101,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 14,
          padding: "28px 28px 24px",
          width: 340,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            color: "var(--color-text-muted)",
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>
 
        {/* Header */}
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--color-text)",
              flexShrink: 0,
            }}
          >
            {member.photoUrl ? (
              <img src={member.photoUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              getInitials(member.username)
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--color-text)" }}>
              {member.username}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 2 }}>
              {ROLE_LABEL[member.role] || member.role}
            </div>
          </div>
        </div>
 
        {/* Info rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          
          <InfoRow label="Team" value={member.teamName || "—"} />
          <InfoRow
            label="Email"
            value={
              <a
                href={`mailto:${member.email}`}
                style={{ color: "var(--color-text)", textDecoration: "underline" }}
              >
                {member.email}
              </a>
            }
          />
          <InfoRow label="Domain Expertise" value={member.domainExpertise || "—"} />
        </div>
 
        {/* Task metrics */}
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: 16,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}
        >
          <MetricChip label="Owned" value={member.ownedTasks ?? 0} color="var(--color-text)" />
          <MetricChip label="Overdue" value={member.overdueTasks ?? 0} color="#ef4444" />
          <MetricChip label="Stale" value={member.staleTasks ?? 0} color="#f59e0b" />
        </div>
      </div>
    </>
  );
}
 
function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          minWidth: 110,
          paddingTop: 1,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, color: "var(--color-text)", lineHeight: 1.4 }}>{value}</span>
    </div>
  );
}
 
function MetricChip({ label, value, color }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "8px 4px",
        background: "var(--color-bg)",
        borderRadius: 8,
        border: "1px solid var(--color-border)",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
    </div>
  );
}
 
/* ── Member row inside a team ── */
function MemberRow({ member, onSelect }) {
  const hasIssues = (member.overdueTasks ?? 0) > 0 || (member.staleTasks ?? 0) > 0;
 
  return (
    <button
      onClick={() => onSelect(member)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "10px 14px",
        background: "none",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-border)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {/* Avatar */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          color: "var(--color-text)",
          flexShrink: 0,
        }}
      >
        {member.photoUrl ? (
          <img src={member.photoUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          getInitials(member.username)
        )}
      </div>
 
      {/* Name + role */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {member.username}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 1 }}>
          {ROLE_LABEL[member.role] || member.role}
        </div>
      </div>
 
      {/* Task badges */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        <TaskBadge value={member.ownedTasks ?? 0} color="var(--color-text-muted)" title="Owned" />
        {(member.overdueTasks ?? 0) > 0 && (
          <TaskBadge value={member.overdueTasks} color="#ef4444" title="Overdue" />
        )}
        {(member.staleTasks ?? 0) > 0 && (
          <TaskBadge value={member.staleTasks} color="#f59e0b" title="Stale" />
        )}
        {hasIssues && (
          <span style={{ fontSize: 12, color: "#ef4444" }} title="Has overdue or stale tasks">⚠</span>
        )}
      </div>
    </button>
  );
}
 
function TaskBadge({ value, color, title }) {
  return (
    <span
      title={title}
      style={{
        fontSize: 11,
        fontWeight: 700,
        color,
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        borderRadius: 20,
        padding: "2px 7px",
        minWidth: 22,
        textAlign: "center",
      }}
    >
      {value}
    </span>
  );
}
 

 

 
/* ── Main page ── */
export default function RollupPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
 

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
const mockData = [
  {
    id: "exec-1",
    username: "Richard Harmon",
    role: "EXECUTIVE",
    teamName: "Executive Leadership",
    email: "r.harmon@everbank.com",
    domainExpertise: "Corporate Strategy, Capital Markets, M&A",
    ownedTasks: 2,
    overdueTasks: 0,
    staleTasks: 0,
    children: [

      // ── Technology Department ────────────────────────────────
      {
        id: "dept-tech",
        username: null,
        role: null,
        teamName: "Technology",
        email: null,
        domainExpertise: null,
        ownedTasks: 0,
        overdueTasks: 0,
        staleTasks: 0,
        children: [
          {
            id: "mgr-tech",
            username: "Marcus Johnson",
            role: "TEAM_MANAGER",
            teamName: "Technology",
            email: "m.johnson@everbank.com",
            domainExpertise: "Engineering Leadership, Cloud Infrastructure, DevOps",
            ownedTasks: 4,
            overdueTasks: 0,
            staleTasks: 1,
            children: [
              // Platform Engineering
              {
                id: "team-platform",
                username: null,
                role: null,
                teamName: "Platform Engineering",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-1",
                    username: "Priya Patel",
                    role: "TEAM_MEMBER",
                    teamName: "Platform Engineering",
                    email: "p.patel@everbank.com",
                    domainExpertise: "API Design, Microservices, Spring Boot",
                    ownedTasks: 8,
                    overdueTasks: 0,
                    staleTasks: 2,
                    children: []
                  },
                  {
                    id: "tm-2",
                    username: "Kevin Zhao",
                    role: "TEAM_MEMBER",
                    teamName: "Platform Engineering",
                    email: "k.zhao@everbank.com",
                    domainExpertise: "Kubernetes, CI/CD, Infrastructure as Code",
                    ownedTasks: 6,
                    overdueTasks: 2,
                    staleTasks: 0,
                    children: []
                  }
                ]
              },
              // Data & AI
              {
                id: "team-data",
                username: null,
                role: null,
                teamName: "Data & AI",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-3",
                    username: "Josh Williams",
                    role: "TEAM_MEMBER",
                    teamName: "Data & AI",
                    email: "j.williams@everbank.com",
                    domainExpertise: "Machine Learning, Feature Engineering, Python",
                    ownedTasks: 5,
                    overdueTasks: 1,
                    staleTasks: 0,
                    children: []
                  },
                  {
                    id: "tm-4",
                    username: "Sophia Nguyen",
                    role: "TEAM_MEMBER",
                    teamName: "Data & AI",
                    email: "s.nguyen@everbank.com",
                    domainExpertise: "Data Engineering, Spark, Databricks",
                    ownedTasks: 6,
                    overdueTasks: 0,
                    staleTasks: 2,
                    children: []
                  }
                ]
              },
              // Cybersecurity
              {
                id: "team-cyber",
                username: null,
                role: null,
                teamName: "Cybersecurity",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-5",
                    username: "Natalie Brooks",
                    role: "TEAM_MEMBER",
                    teamName: "Cybersecurity",
                    email: "n.brooks@everbank.com",
                    domainExpertise: "Threat Detection, Penetration Testing, SIEM",
                    ownedTasks: 4,
                    overdueTasks: 0,
                    staleTasks: 1,
                    children: []
                  },
                  {
                    id: "tm-6",
                    username: "Omar Hussain",
                    role: "TEAM_MEMBER",
                    teamName: "Cybersecurity",
                    email: "o.hussain@everbank.com",
                    domainExpertise: "Identity & Access Management, Zero Trust",
                    ownedTasks: 3,
                    overdueTasks: 1,
                    staleTasks: 0,
                    children: []
                  }
                ]
              },
              // Digital Banking
              {
                id: "team-digital",
                username: null,
                role: null,
                teamName: "Digital Banking",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-7",
                    username: "Emily Tran",
                    role: "TEAM_MEMBER",
                    teamName: "Digital Banking",
                    email: "e.tran@everbank.com",
                    domainExpertise: "Mobile Banking, React Native, UX Engineering",
                    ownedTasks: 7,
                    overdueTasks: 0,
                    staleTasks: 0,
                    children: []
                  },
                  {
                    id: "tm-8",
                    username: "Daniel Foster",
                    role: "TEAM_MEMBER",
                    teamName: "Digital Banking",
                    email: "d.foster@everbank.com",
                    domainExpertise: "Web Performance, Frontend Architecture",
                    ownedTasks: 5,
                    overdueTasks: 1,
                    staleTasks: 1,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },

      // ── Operations Department ────────────────────────────────
      {
        id: "dept-ops",
        username: null,
        role: null,
        teamName: "Operations",
        email: null,
        domainExpertise: null,
        ownedTasks: 0,
        overdueTasks: 0,
        staleTasks: 0,
        children: [
          {
            id: "mgr-ops",
            username: "Lisa Monroe",
            role: "TEAM_MANAGER",
            teamName: "Operations",
            email: "l.monroe@everbank.com",
            domainExpertise: "Operational Risk, Process Optimization, Regulatory Affairs",
            ownedTasks: 3,
            overdueTasks: 1,
            staleTasks: 0,
            children: [
              {
                id: "team-compliance",
                username: null,
                role: null,
                teamName: "Compliance",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-9",
                    username: "David Park",
                    role: "TEAM_MEMBER",
                    teamName: "Compliance",
                    email: "d.park@everbank.com",
                    domainExpertise: "Regulatory Reporting, AML, BSA",
                    ownedTasks: 3,
                    overdueTasks: 2,
                    staleTasks: 1,
                    children: []
                  },
                  {
                    id: "tm-10",
                    username: "Rachel Kim",
                    role: "TEAM_MEMBER",
                    teamName: "Compliance",
                    email: "r.kim@everbank.com",
                    domainExpertise: "KYC, GDPR, Policy Writing",
                    ownedTasks: 5,
                    overdueTasks: 0,
                    staleTasks: 0,
                    children: []
                  }
                ]
              },
              {
                id: "team-risk",
                username: null,
                role: null,
                teamName: "Risk Management",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-11",
                    username: "James Okafor",
                    role: "TEAM_MEMBER",
                    teamName: "Risk Management",
                    email: "j.okafor@everbank.com",
                    domainExpertise: "Credit Risk, Stress Testing, Basel III",
                    ownedTasks: 4,
                    overdueTasks: 1,
                    staleTasks: 0,
                    children: []
                  },
                  {
                    id: "tm-12",
                    username: "Sandra Reyes",
                    role: "TEAM_MEMBER",
                    teamName: "Risk Management",
                    email: "s.reyes@everbank.com",
                    domainExpertise: "Operational Risk, Loss Event Reporting",
                    ownedTasks: 3,
                    overdueTasks: 0,
                    staleTasks: 2,
                    children: []
                  }
                ]
              },
              {
                id: "team-fraud",
                username: null,
                role: null,
                teamName: "Fraud & Investigations",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-13",
                    username: "Tyler Moss",
                    role: "TEAM_MEMBER",
                    teamName: "Fraud & Investigations",
                    email: "t.moss@everbank.com",
                    domainExpertise: "Transaction Monitoring, Fraud Analytics",
                    ownedTasks: 6,
                    overdueTasks: 2,
                    staleTasks: 0,
                    children: []
                  },
                  {
                    id: "tm-14",
                    username: "Camille Dubois",
                    role: "TEAM_MEMBER",
                    teamName: "Fraud & Investigations",
                    email: "c.dubois@everbank.com",
                    domainExpertise: "Digital Fraud, Chargeback Management",
                    ownedTasks: 4,
                    overdueTasks: 0,
                    staleTasks: 1,
                    children: []
                  }
                ]
              },
              {
                id: "team-bizops",
                username: null,
                role: null,
                teamName: "Business Operations",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-15",
                    username: "Anthony Bell",
                    role: "TEAM_MEMBER",
                    teamName: "Business Operations",
                    email: "a.bell@everbank.com",
                    domainExpertise: "Vendor Management, SLA Governance",
                    ownedTasks: 5,
                    overdueTasks: 1,
                    staleTasks: 0,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },

      // ── Retail Banking Department ────────────────────────────
      {
        id: "dept-retail",
        username: null,
        role: null,
        teamName: "Retail Banking",
        email: null,
        domainExpertise: null,
        ownedTasks: 0,
        overdueTasks: 0,
        staleTasks: 0,
        children: [
          {
            id: "mgr-retail",
            username: "Aisha Thompson",
            role: "TEAM_MANAGER",
            teamName: "Retail Banking",
            email: "a.thompson@everbank.com",
            domainExpertise: "Retail Strategy, Customer Acquisition, Branch Operations",
            ownedTasks: 4,
            overdueTasks: 0,
            staleTasks: 0,
            children: [
              {
                id: "team-lending",
                username: null,
                role: null,
                teamName: "Consumer Lending",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-16",
                    username: "Marcus Webb",
                    role: "TEAM_MEMBER",
                    teamName: "Consumer Lending",
                    email: "m.webb@everbank.com",
                    domainExpertise: "Auto Loans, Personal Loans, Credit Underwriting",
                    ownedTasks: 5,
                    overdueTasks: 0,
                    staleTasks: 1,
                    children: []
                  },
                  {
                    id: "tm-17",
                    username: "Grace Oluwole",
                    role: "TEAM_MEMBER",
                    teamName: "Consumer Lending",
                    email: "g.oluwole@everbank.com",
                    domainExpertise: "Mortgage Origination, Home Equity",
                    ownedTasks: 6,
                    overdueTasks: 1,
                    staleTasks: 0,
                    children: []
                  }
                ]
              },
              {
                id: "team-deposits",
                username: null,
                role: null,
                teamName: "Deposits & Accounts",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-18",
                    username: "Brian Cho",
                    role: "TEAM_MEMBER",
                    teamName: "Deposits & Accounts",
                    email: "b.cho@everbank.com",
                    domainExpertise: "Deposit Products, Account Servicing",
                    ownedTasks: 3,
                    overdueTasks: 0,
                    staleTasks: 0,
                    children: []
                  }
                ]
              },
              {
                id: "team-wealth",
                username: null,
                role: null,
                teamName: "Wealth Management",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-19",
                    username: "Melissa Grant",
                    role: "TEAM_MEMBER",
                    teamName: "Wealth Management",
                    email: "m.grant@everbank.com",
                    domainExpertise: "Investment Advisory, Portfolio Management, CFP",
                    ownedTasks: 7,
                    overdueTasks: 2,
                    staleTasks: 1,
                    children: []
                  }
                ]
              },
              {
                id: "team-cx",
                username: null,
                role: null,
                teamName: "Customer Experience",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-20",
                    username: "Paul Adeyemi",
                    role: "TEAM_MEMBER",
                    teamName: "Customer Experience",
                    email: "p.adeyemi@everbank.com",
                    domainExpertise: "Journey Mapping, NPS, VOC Programs",
                    ownedTasks: 4,
                    overdueTasks: 0,
                    staleTasks: 2,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },

      // ── Commercial Banking Department ────────────────────────
      {
        id: "dept-commercial",
        username: null,
        role: null,
        teamName: "Commercial Banking",
        email: null,
        domainExpertise: null,
        ownedTasks: 0,
        overdueTasks: 0,
        staleTasks: 0,
        children: [
          {
            id: "mgr-commercial",
            username: "Christine Hale",
            role: "TEAM_MANAGER",
            teamName: "Commercial Banking",
            email: "c.hale@everbank.com",
            domainExpertise: "Commercial Credit, Relationship Banking, Syndications",
            ownedTasks: 3,
            overdueTasks: 0,
            staleTasks: 0,
            children: [
              {
                id: "team-bizlending",
                username: null,
                role: null,
                teamName: "Business Lending",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-21",
                    username: "Robert Steele",
                    role: "TEAM_MEMBER",
                    teamName: "Business Lending",
                    email: "r.steele@everbank.com",
                    domainExpertise: "SBA Lending, Business Credit Analysis",
                    ownedTasks: 5,
                    overdueTasks: 1,
                    staleTasks: 0,
                    children: []
                  }
                ]
              },
              {
                id: "team-cre",
                username: null,
                role: null,
                teamName: "Commercial Real Estate",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-22",
                    username: "Nina Castillo",
                    role: "TEAM_MEMBER",
                    teamName: "Commercial Real Estate",
                    email: "n.castillo@everbank.com",
                    domainExpertise: "CRE Underwriting, Construction Lending",
                    ownedTasks: 6,
                    overdueTasks: 0,
                    staleTasks: 1,
                    children: []
                  }
                ]
              },
              {
                id: "team-treasury",
                username: null,
                role: null,
                teamName: "Treasury Services",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-23",
                    username: "Elijah Turner",
                    role: "TEAM_MEMBER",
                    teamName: "Treasury Services",
                    email: "e.turner@everbank.com",
                    domainExpertise: "Cash Management, Liquidity, FX",
                    ownedTasks: 4,
                    overdueTasks: 2,
                    staleTasks: 0,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },

      // ── Finance Department ───────────────────────────────────
      {
        id: "dept-finance",
        username: null,
        role: null,
        teamName: "Finance",
        email: null,
        domainExpertise: null,
        ownedTasks: 0,
        overdueTasks: 0,
        staleTasks: 0,
        children: [
          {
            id: "mgr-finance",
            username: "Helen Zhang",
            role: "TEAM_MANAGER",
            teamName: "Finance",
            email: "h.zhang@everbank.com",
            domainExpertise: "Financial Planning, FP&A, GAAP, IFRS",
            ownedTasks: 3,
            overdueTasks: 0,
            staleTasks: 1,
            children: [
              {
                id: "team-corpfin",
                username: null,
                role: null,
                teamName: "Corporate Finance",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-24",
                    username: "Victor Osei",
                    role: "TEAM_MEMBER",
                    teamName: "Corporate Finance",
                    email: "v.osei@everbank.com",
                    domainExpertise: "Capital Allocation, Budgeting, Forecasting",
                    ownedTasks: 4,
                    overdueTasks: 1,
                    staleTasks: 0,
                    children: []
                  }
                ]
              },
              {
                id: "team-reporting",
                username: null,
                role: null,
                teamName: "Financial Reporting",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-25",
                    username: "Laura Simmons",
                    role: "TEAM_MEMBER",
                    teamName: "Financial Reporting",
                    email: "l.simmons@everbank.com",
                    domainExpertise: "SEC Reporting, Financial Statements, Consolidations",
                    ownedTasks: 5,
                    overdueTasks: 0,
                    staleTasks: 0,
                    children: []
                  }
                ]
              },
              {
                id: "team-audit",
                username: null,
                role: null,
                teamName: "Internal Audit",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-26",
                    username: "Derek Flynn",
                    role: "TEAM_MEMBER",
                    teamName: "Internal Audit",
                    email: "d.flynn@everbank.com",
                    domainExpertise: "SOX Compliance, Internal Controls, IT Audit",
                    ownedTasks: 3,
                    overdueTasks: 0,
                    staleTasks: 2,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },

      // ── People & Strategy Department ─────────────────────────
      {
        id: "dept-people",
        username: null,
        role: null,
        teamName: "People & Strategy",
        email: null,
        domainExpertise: null,
        ownedTasks: 0,
        overdueTasks: 0,
        staleTasks: 0,
        children: [
          {
            id: "mgr-people",
            username: "Tonya Rivera",
            role: "TEAM_MANAGER",
            teamName: "People & Strategy",
            email: "t.rivera@everbank.com",
            domainExpertise: "HR Strategy, Organizational Design, Executive Coaching",
            ownedTasks: 3,
            overdueTasks: 0,
            staleTasks: 0,
            children: [
              {
                id: "team-talent",
                username: null,
                role: null,
                teamName: "Talent Acquisition",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-27",
                    username: "Samuel Knight",
                    role: "TEAM_MEMBER",
                    teamName: "Talent Acquisition",
                    email: "s.knight@everbank.com",
                    domainExpertise: "Technical Recruiting, Employer Branding",
                    ownedTasks: 5,
                    overdueTasks: 1,
                    staleTasks: 0,
                    children: []
                  }
                ]
              },
              {
                id: "team-ld",
                username: null,
                role: null,
                teamName: "Learning & Development",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-28",
                    username: "Fatima Al-Hassan",
                    role: "TEAM_MEMBER",
                    teamName: "Learning & Development",
                    email: "f.alhassan@everbank.com",
                    domainExpertise: "Leadership Programs, L&D Strategy, LMS",
                    ownedTasks: 4,
                    overdueTasks: 0,
                    staleTasks: 1,
                    children: []
                  }
                ]
              },
              {
                id: "team-strategy",
                username: null,
                role: null,
                teamName: "Corporate Strategy",
                email: null,
                domainExpertise: null,
                ownedTasks: 0,
                overdueTasks: 0,
                staleTasks: 0,
                children: [
                  {
                    id: "tm-29",
                    username: "Ian McAllister",
                    role: "TEAM_MEMBER",
                    teamName: "Corporate Strategy",
                    email: "i.mcallister@everbank.com",
                    domainExpertise: "Market Analysis, Strategic Planning, M&A Due Diligence",
                    ownedTasks: 6,
                    overdueTasks: 0,
                    staleTasks: 0,
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];
  useEffect(() => {
    let active = true;
 
    async function load() {
      setLoading(true);
      try {
        
        //const data = await request("GET", `${BOARD_BASE_URL}/orgchart`);
        
        if (active) {
          //setUsers(Array.isArray(data) ? data : []);
          setUsers(mockData);
        }
      } catch (err) {
        if (active) setError("Failed to load rollup data.");
      } finally {
        if (active) setLoading(false);
      }
    }
 
    load();
    return () => { active = false; };
  }, []);
 
function OrgNode({ node, depth = 0, onSelect, search }) {
  const [collapsed, setCollapsed] = useState(false);
  const q = search.toLowerCase();

  const isPerson = !!node.username;
  const isLeaf = isPerson && (!node.children || node.children.length === 0);

  const matches =
    !q ||
    node.username?.toLowerCase().includes(q) ||
    node.teamName?.toLowerCase().includes(q) ||
    node.domainExpertise?.toLowerCase().includes(q);

  // Leaf person node — just a row
  if (isLeaf) {
    if (!matches) return null;
    return <MemberRow member={node} onSelect={onSelect} />;
  }

  // Person with children (manager) — render row + indented children
  if (isPerson) {
    return (
      <>
        <MemberRow member={node} onSelect={onSelect} />
        <div style={{ paddingLeft: 16 }}>
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} search={search} />
          ))}
        </div>
      </>
    );
  }

  // Group node (department or team header) — collapsible section
  return (
    <section style={{ marginBottom: depth <= 1 ? 20 : 8 }}>
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "10px 0",
          background: "none",
          border: "none",
          borderBottom: depth === 0
            ? "2px solid var(--color-border)"
            : "1px solid var(--color-border)",
          cursor: "pointer",
          textAlign: "left",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          {collapsed ? "▶" : "▼"}
        </span>
        <span style={{
          fontSize: depth === 0 ? 14 : depth === 1 ? 13 : 12,
          fontWeight: depth <= 1 ? 700 : 600,
          color: "var(--color-text)",
          textTransform: depth === 0 ? "uppercase" : "none",
          letterSpacing: depth === 0 ? "0.08em" : "normal",
          flex: 1,
        }}>
          {node.teamName}
        </span>
      </button>

      {!collapsed && (
        <div style={{ paddingLeft: depth === 0 ? 0 : 12 }}>
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} search={search} />
          ))}
        </div>
      )}
    </section>
  );
}
 
  const handleSelect = useCallback((member) => setSelectedUser(member), []);
  const handleClose = useCallback(() => setSelectedUser(null), []);
 
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }
 

return (
  <div className="app-shell rollup-shell">
    <Sidebar user={user} />

    <div className="main-column">
      <header className="topbar">
        <div className="board-title-block">
          <h1>Rollup</h1>
          <p>Company-wide ownership &amp; accountability</p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="btn-ghost" onClick={toggleTheme}>
            {theme === "light" ? "Dark" : "Light"}
          </button>
          <button type="button" className="btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="rollup-page">
        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="search"
            placeholder="Search by name, team, or expertise…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 420,
              padding: "8px 12px",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              fontSize: 13,
              background: "var(--color-surface)",
              color: "var(--color-text)",
              outline: "none",
            }}
          />
        </div>

        {loading && (
          <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Loading…</p>
        )}

        {error && (
          <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            {users.map((node) => (
              <OrgNode key={node.id} node={node} onSelect={handleSelect} search={search} />
            ))}

            {users.length === 0 && (
              <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                No users found{search ? " matching your search" : ""}.
              </p>
            )}
          </>
        )}
      </main>
    </div>

    {selectedUser && (
      <UserPopup member={selectedUser} onClose={handleClose} />
    )}
  </div>
);
}
 