import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { formatDate } from '../utils.js';

function prettyJson(value) {
  if (!value) return '-';

  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  return JSON.stringify(value, null, 2);
}

function getErrorText(log) {
  if (!log?.error_message) return '';
  if (typeof log.error_message === 'string') return log.error_message;
  return JSON.stringify(log.error_message);
}

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadLogs() {
      const { data, error: logsError } = await supabase
        .from('llm_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (logsError) {
        setError(logsError.message);
        return;
      }

      const rows = data || [];
      setLogs(rows);
      setSelectedId(rows[0]?.id || '');
    }

    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return logs;

    return logs.filter((log) => {
      const model = (log.model || '').toLowerCase();
      const rawOutput = (log.raw_output || '').toLowerCase();
      const parsedOutput = prettyJson(log.parsed_output).toLowerCase();

      return model.includes(query) || rawOutput.includes(query) || parsedOutput.includes(query);
    });
  }, [logs, search]);

  const selectedLog = useMemo(() => {
    return logs.find((log) => log.id === selectedId) || filteredLogs[0] || null;
  }, [logs, selectedId, filteredLogs]);

  const stats = useMemo(() => {
    const totalLogs = logs.length;

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

    const errorCount = logs.filter((log) => Boolean(getErrorText(log))).length;

    return {
      totalLogs,
      totalTokens,
      avgLatency,
      errorCount,
    };
  }, [logs]);

  return (
    <div className="stack">
      <header className="page-header">
        <p className="eyebrow">Observability</p>
        <h1>LLM Logs</h1>
        <p>
          Inspect every AI call, including input messages, raw output, parsed JSON, token usage,
          latency, model choice, and errors.
        </p>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="stats-grid">
        <div className="stat-card">
          <span>Total Logs</span>
          <strong>{stats.totalLogs}</strong>
        </div>

        <div className="stat-card">
          <span>Total Tokens</span>
          <strong>{stats.totalTokens.toLocaleString()}</strong>
        </div>

        <div className="stat-card">
          <span>Avg Latency</span>
          <strong>{stats.avgLatency ? `${stats.avgLatency}ms` : '-'}</strong>
        </div>

        <div className="stat-card">
          <span>Error Count</span>
          <strong>{stats.errorCount}</strong>
        </div>
      </section>

      <section className="logs-grid">
        <div className="card stack">
          <div className="section-header">
            <div>
              <h2>Log entries</h2>
              <p>{filteredLogs.length} log{filteredLogs.length === 1 ? '' : 's'} found.</p>
            </div>
          </div>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search model or output..."
          />

          {filteredLogs.length === 0 ? (
            <p className="muted">No logs found.</p>
          ) : (
            <div className="log-list">
              {filteredLogs.map((log) => {
                const hasError = Boolean(getErrorText(log));
                const isActive = selectedLog?.id === log.id;

                return (
                  <button
                    type="button"
                    className={`log-row ${isActive ? 'active' : ''}`}
                    key={log.id}
                    onClick={() => setSelectedId(log.id)}
                  >
                    <strong className="break-anywhere">{log.model || 'Unknown model'}</strong>
                    <span>
                      {Number(log.total_tokens || 0).toLocaleString()} tokens · {log.latency_ms || 0}ms
                    </span>
                    <small>{formatDate(log.created_at)}</small>
                    {hasError && <em className="log-error-pill">Error</em>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="card stack">
          <div className="section-header">
            <div>
              <h2>Selected log detail</h2>
              <p>Review the exact model call and structured output.</p>
            </div>

            {selectedLog && (
              <span className={`badge ${getErrorText(selectedLog) ? 'danger-badge' : ''}`}>
                {getErrorText(selectedLog) ? 'Error' : 'Success'}
              </span>
            )}
          </div>

          {!selectedLog ? (
            <p className="muted">Select a log to inspect details.</p>
          ) : (
            <>
              <div className="model-detail-line">
                <span>Model</span>
                <strong className="break-anywhere">
                  {selectedLog.model || 'Unknown'}
                </strong>
              </div>

            <div className="metrics-grid">
              <div>
                <span>Input tokens</span>
                <strong>{selectedLog.input_tokens || 0}</strong>
              </div>

              <div>
                <span>Output tokens</span>
                <strong>{selectedLog.output_tokens || 0}</strong>
              </div>

              <div>
                <span>Total tokens</span>
                <strong>{selectedLog.total_tokens || 0}</strong>
              </div>

              <div>
                <span>Latency</span>
                <strong>{selectedLog.latency_ms || 0}ms</strong>
              </div>
            </div>

              {getErrorText(selectedLog) && (
                <div className="error">
                  <strong>Error message:</strong> {getErrorText(selectedLog)}
                </div>
              )}

              <div className="stack small-gap">
                <h3>Input messages</h3>
                <pre className="json-box">{prettyJson(selectedLog.input_messages)}</pre>
              </div>

              <div className="stack small-gap">
                <h3>Raw output</h3>
                <pre className="json-box">{prettyJson(selectedLog.raw_output)}</pre>
              </div>

              <div className="stack small-gap">
                <h3>Parsed output</h3>
                <pre className="json-box">{prettyJson(selectedLog.parsed_output)}</pre>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}