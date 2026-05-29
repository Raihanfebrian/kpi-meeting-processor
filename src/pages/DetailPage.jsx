import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMeeting, updateMeeting } from '../api.js';
import MeetingEditor from '../components/MeetingEditor.jsx';

export default function DetailPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMeeting() {
      try {
        const data = await fetchMeeting(id);
        setMeeting(data);
      } catch (err) {
        setError(err.message || 'Failed to load meeting.');
      } finally {
        setLoading(false);
      }
    }
    loadMeeting();
  }, [id]);

  async function handleSaveEdits(payload) {
    const saved = await updateMeeting(id, payload);
    setMeeting(saved);
    return saved;
  }

  return (
    <div className="page stack">
      <header className="page-header">
        <p className="eyebrow">Meeting Detail</p>
        <h1>Review, edit, and export meeting notes</h1>
      </header>

      {loading && <p className="muted">Loading meeting...</p>}
      {error && <p className="error">{error}</p>}
      {meeting && <MeetingEditor initialMeeting={meeting} onSave={handleSaveEdits} />}
    </div>
  );
}
