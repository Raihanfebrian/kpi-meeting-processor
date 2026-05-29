import { useEffect, useState } from 'react';
import { fetchLogs } from '../api.js';
import { formatDate } from '../utils.js';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await fetchLogs();
        setLogs(data);
        setSelectedLog(data[0] || null);
      } catch (err) {
        setError(err.message || 'Failed to load LLM logs.');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="page stack">
      <header className="page-header">
        <p className="eyebrow">Observability</p>
        <h1>LLM Logs</h1>
        <p>Each model call should show input, output, model, token count, latency, and errors.</p>
      </header>

      {loading && <p className="muted">Loading logs...</p>}
      {error && <p className="error">{error}</p>}

      <section className="logs-grid">
        <div className="card stack">
          <h2>Log entries</h2>
          {logs.length === 0 && !loading && <p className="muted">No logs yet.</p>}
          <div className="log-list">
            {logs.map((log) => (
              <button
                type="button"
                key={log.id}
                className={`log-row ${selectedLog?.id === log.id ? 'active' : ''}`}
                onClick={() => setSelectedLog(log)}
              >
                <strong>{log.model}</strong>
                <span>{log.total_tokens || 0} tokens · {log.latency_ms || 0}ms</span>
                <small>{formatDate(log.created_at)}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="card stack">
          <h2>Selected log detail</h2>
          {!selectedLog && <p className="muted">Select a log to inspect details.</p>}
          {selectedLog && (
            <div className="stack">
              <div className="metrics-grid">
                <div><span>Model</span><strong>{selectedLog.model}</strong></div>
                <div><span>Input tokens</span><strong>{selectedLog.input_tokens || 0}</strong></div>
                <div><span>Output tokens</span><strong>{selectedLog.output_tokens || 0}</strong></div>
                <div><span>Total tokens</span><strong>{selectedLog.total_tokens || 0}</strong></div>
                <div><span>Latency</span><strong>{selectedLog.latency_ms || 0}ms</strong></div>
              </div>
              {selectedLog.error_message && <p className="error">{selectedLog.error_message}</p>}
              <label>
                Input messages
                <pre className="json-box">{JSON.stringify(selectedLog.input_messages, null, 2)}</pre>
              </label>
              <label>
                Raw output
                <pre className="json-box">{selectedLog.raw_output}</pre>
              </label>
              <label>
                Parsed output
                <pre className="json-box">{JSON.stringify(selectedLog.parsed_output, null, 2)}</pre>
              </label>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
