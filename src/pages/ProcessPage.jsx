import { useState } from 'react';
import { processTranscript, updateMeeting } from '../api.js';
import MeetingEditor from '../components/MeetingEditor.jsx';

export default function ProcessPage() {
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.txt')) {
      setError('Please upload a .txt transcript file.');
      return;
    }
    const text = await file.text();
    setTranscript(text);
    if (!title) setTitle(file.name.replace(/\.txt$/i, ''));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMeeting(null);

    if (!title.trim()) {
      setError('Meeting title is required.');
      return;
    }

    if (!transcript.trim()) {
      setError('Transcript is required.');
      return;
    }

    setLoading(true);
    try {
      const result = await processTranscript({
        title: title.trim(),
        transcript: transcript.trim(),
      });
      setMeeting(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process transcript.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdits(payload) {
    const saved = await updateMeeting(meeting.id || meeting.meeting_id, payload);
    setMeeting(saved);
    return saved;
  }

  return (
    <div className="page stack">
      <header className="page-header">
        <p className="eyebrow">Process Transcript</p>
        <h1>Paste or upload a transcript, then generate structured meeting notes.</h1>
      </header>

      <section className="card stack">
        <form className="stack" onSubmit={handleSubmit}>
          <label>
            Meeting title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Meta Campaign Review - May 28"
            />
          </label>

        <label>
          Upload .txt transcript
          <div className="file-upload-card">
            <input
              id="transcript-file"
              className="file-upload-input"
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileUpload}
            />

            <label className="file-upload-button" htmlFor="transcript-file">
              <span className="file-upload-icon">↥</span>
              <span>
                <strong>Choose transcript file</strong>
                <small>Upload a .txt file from Fireflies, Otter, or meeting notes.</small>
              </span>
            </label>

            <p className="file-upload-name">
              {transcript ? 'Transcript loaded. You can still edit it below.' : 'No file selected yet.'}
            </p>
          </div>
        </label>

          <label>
            Raw transcript
            <textarea
              rows="12"
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              placeholder="Paste Fireflies/Otter transcript here..."
            />
          </label>

          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Process transcript'}</button>
        </form>
      </section>

      {meeting && (
        <MeetingEditor initialMeeting={meeting} onSave={handleSaveEdits} />
      )}
    </div>
  );
}
