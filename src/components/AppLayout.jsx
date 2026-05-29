import { NavLink, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar no-print">
        <div className="brand-block">
          <div className="brand-row">
            <span className="brand-mark">K</span>
            <div>
              <p className="eyebrow sidebar-eyebrow">KPI Media Case Study</p>
              <h1>KPI Meeting Processor</h1>
            </div>
          </div>

          <p className="sidebar-copy">
            Turn raw meeting transcripts into editable summaries, action items, decisions, and auditable LLM logs.
          </p>
        </div>

        <nav>
          <NavLink to="/" end>
            <span>Process</span>
          </NavLink>
          <NavLink to="/history">
            <span>History</span>
          </NavLink>
          <NavLink to="/logs">
            <span>LLM Logs</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>Production AI workflow</span>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}