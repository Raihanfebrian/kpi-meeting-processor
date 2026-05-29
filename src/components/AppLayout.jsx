import { NavLink, Outlet } from 'react-router-dom';

function ProcessIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function LogsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-9" />
    </svg>
  );
}

export default function AppLayout() {
  return (
    <div className="app-shell">
      <header className="top-nav no-print">
        <div className="top-nav-inner">
          <NavLink className="top-brand" to="/" end>
            <span className="brand-mark">K</span>
            <span className="brand-text">
              <span className="brand-kicker">KPI Media Case Study</span>
              <strong>KPI Meeting Processor</strong>
            </span>
          </NavLink>

          <nav className="top-nav-links" aria-label="Primary navigation">
            <NavLink to="/" end>
              <ProcessIcon />
              <span>Process</span>
            </NavLink>

            <NavLink to="/history">
              <HistoryIcon />
              <span>History</span>
            </NavLink>

            <NavLink to="/logs">
              <LogsIcon />
              <span>LLM Logs</span>
            </NavLink>
          </nav>

          <div className="top-nav-status">
            <span className="status-dot" />
            <span>Production AI workflow</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}