import { useEffect, useState } from 'react';
import { processTranscript, updateMeeting } from '../api.js';
import MeetingEditor from '../components/MeetingEditor.jsx';

const loadingSteps = [
  'Sending transcript',
  'Processing with AI',
  'Extracting action items',
  'Saving meeting notes',
];

export default function ProcessPage() {
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) return undefined;

    const interval = setInterval(() => {
      setActiveStep((currentStep) => {
        if (currentStep >= loadingSteps.length - 1) return currentStep;
        return currentStep + 1;
      });
    }, 850);

    return () => clearInterval(interval);
  }, [loading]);

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setError('Please upload a .txt transcript file.');
      event.target.value = '';
      return;
    }

    const text = await file.text();
    setTranscript(text);
    setError('');

    if (!title.trim()) {
      setTitle(file.name.replace(/\.txt$/i, ''));
    }
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
    setActiveStep(0);

    try {
      const result = await processTranscript({
        title: title.trim(),
        transcript: transcript.trim(),
      });

      setActiveStep(loadingSteps.length - 1);
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
        <h1>Turn transcripts into action-ready notes.</h1>
        <p>
          Upload or paste a meeting transcript. Get a clean summary, action items,
          and key decisions in seconds.
        </p>
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

          <div className="form-field">
            <span className="field-label">Upload .txt transcript</span>

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
          </div>

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

          {loading && (
            <div className="loading-card">
              <div className="loading-card-header">
                <strong>Processing transcript</strong>
                <span>{activeStep + 1}/{loadingSteps.length}</span>
              </div>

              <div className="loading-steps">
                {loadingSteps.map((step, index) => (
                  <div
                    className={`loading-step ${index <= activeStep ? 'active' : ''}`}
                    key={step}
                  >
                    <span className="loading-dot" />
                    <p>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Process transcript'}
          </button>
        </form>
      </section>

      {meeting && (
        <MeetingEditor initialMeeting={meeting} onSave={handleSaveEdits} />
      )}
    </div>
  );
}