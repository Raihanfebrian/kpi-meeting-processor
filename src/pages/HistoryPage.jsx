import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMeetings } from '../api.js';
import { formatDate } from '../utils.js';

export default function HistoryPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMeetings() {
      try {
        const data = await fetchMeetings();
        setMeetings(data);
      } catch (err) {
        setError(err.message || 'Failed to load meetings.');
      } finally {
        setLoading(false);
      }
    }
    loadMeetings();
  }, []);

  return (
    <div className="page stack">
      <header className="page-header">
        <p className="eyebrow">History</p>
        <h1>Past processed meetings</h1>
      </header>

      {loading && <p className="muted">Loading meetings...</p>}
      {error && <p className="error">{error}</p>}

      <section className="card stack">
        {meetings.length === 0 && !loading && <p className="muted">No processed meetings yet.</p>}
        {meetings.map((meeting) => (
          <Link className="history-row" key={meeting.id} to={`/meeting/${meeting.id}`}>
            <div>
              <h2>{meeting.title}</h2>
              <p>{meeting.summary || 'No summary available.'}</p>
              <small>Processed: {formatDate(meeting.created_at)}</small>
            </div>
            <span className="badge">{meeting.status || 'processed'}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
