import { NavLink, Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">KPI Media Case Study</p>
          <h1>Meeting Processor</h1>
          <p className="sidebar-copy">Turn raw meeting transcripts into editable summaries, action items, and decisions.</p>
        </div>
        <nav>
          <NavLink to="/" end>Process</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/logs">LLM Logs</NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
