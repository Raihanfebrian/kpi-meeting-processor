import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import { formatDate, safeArray } from '../utils.js';

export default function HistoryPage() {
  const [meetings, setMeetings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false });

      if (meetingsError) {
        setError(meetingsError.message);
        return;
      }

      const { data: logsData, error: logsError } = await supabase
        .from('llm_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (logsError) {
        setError(logsError.message);
        return;
      }

      setMeetings(meetingsData || []);
      setLogs(logsData || []);
    }

    loadData();
  }, []);

  const filteredMeetings = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return meetings;

    return meetings.filter((meeting) => {
      const title = (meeting.title || '').toLowerCase();
      const summary = (meeting.summary || '').toLowerCase();
      return title.includes(query) || summary.includes(query);
    });
  }, [meetings, search]);

  const stats = useMemo(() => {
    const totalMeetings = meetings.length;

    const totalActionItems = meetings.reduce((sum, meeting) => {
      return sum + safeArray(meeting.action_items).length;
    }, 0);

    const totalTokens = logs.reduce((sum, log) => {
      return sum + Number(log.total_tokens || 0);
    }, 0);

    const logsWithLatency = logs.filter((log) => Number(log.latency_ms || 0) > 0);
    const avgLatency = logsWithLatency.length
      ? Math.round(
          logsWithLatency.reduce((sum, log) => sum + Number(log.latency_ms || 0), 0) /
            logsWithLatency.length
        )
      : 0;

    return {
      totalMeetings,
      totalActionItems,
      totalTokens,
      avgLatency,
    };
  }, [meetings, logs]);

  return (
    <div className="stack">
      <header className="page-header">
        <p className="eyebrow">History</p>
        <h1>Past processed meetings</h1>
        <p>
          Reopen previous AI-processed meeting notes, review saved summaries, and track how much
          structured output the tool has generated.
        </p>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Meetings</span>
          <strong>{stats.totalMeetings}</strong>
        </div>
        <div className="stat-card">
          <span>Total Action Items</span>
          <strong>{stats.totalActionItems}</strong>
        </div>
        <div className="stat-card">
          <span>Total Tokens Used</span>
          <strong>{stats.totalTokens.toLocaleString()}</strong>
        </div>
        <div className="stat-card">
          <span>Avg LLM Latency</span>
          <strong>{stats.avgLatency ? `${stats.avgLatency}ms` : '-'}</strong>
        </div>
      </section>

      <section className="card stack">
        <div className="section-header">
          <div>
            <h2>Meeting history</h2>
            <p>Search by title or summary.</p>
          </div>
          <div className="history-search">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search meetings..."
            />
          </div>
        </div>

        {filteredMeetings.length === 0 ? (
          <p className="muted">No processed meetings found.</p>
        ) : (
          <div className="stack small-gap">
            {filteredMeetings.map((meeting) => (
              <Link className="history-row" key={meeting.id} to={`/meeting/${meeting.id}`}>
                <div>
                  <h2>{meeting.title || 'Untitled Meeting'}</h2>
                  <p>{meeting.summary || 'No summary available.'}</p>
                  <small>Processed: {formatDate(meeting.created_at)}</small>
                </div>
                <span className="badge">{meeting.status || 'processed'}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}