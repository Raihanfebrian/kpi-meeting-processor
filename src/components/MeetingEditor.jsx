import { useMemo, useState } from 'react';
import ActionItemsEditor from './ActionItemsEditor.jsx';
import DecisionsEditor from './DecisionsEditor.jsx';
import { sendMeetingToSlack } from '../api.js';
import {
  buildMarkdown,
  buildSlackMessage,
  copyText,
  downloadMarkdown,
  safeArray,
} from '../utils.js';

export default function MeetingEditor({ initialMeeting, onSave }) {
  const [meeting, setMeeting] = useState({
    ...initialMeeting,
    action_items: safeArray(initialMeeting.action_items),
    key_decisions: safeArray(initialMeeting.key_decisions),
    warnings: safeArray(initialMeeting.warnings),
  });

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [sendingSlack, setSendingSlack] = useState(false);
  const [saveConfirmed, setSaveConfirmed] = useState(false);

  const markdown = useMemo(() => buildMarkdown(meeting), [meeting]);
  const slackMessage = useMemo(() => buildSlackMessage(meeting), [meeting]);

  const missingInfoCount = useMemo(() => {
    return safeArray(meeting.action_items).filter((item) => !item.owner || !item.deadline).length;
  }, [meeting.action_items]);

  async function saveCurrentMeeting(successMessage = 'Saved edited result.') {
    const saved = await onSave({
      title: meeting.title,
      summary: meeting.summary,
      action_items: meeting.action_items,
      key_decisions: meeting.key_decisions,
      warnings: meeting.warnings,
    });

    const normalizedSaved = {
      ...(saved || meeting),
      action_items: safeArray((saved || meeting).action_items),
      key_decisions: safeArray((saved || meeting).key_decisions),
      warnings: safeArray((saved || meeting).warnings),
    };

    setMeeting(normalizedSaved);

    if (successMessage) {
      setNotice(successMessage);
    }

    return normalizedSaved;
  }

  function showSavedConfirmation() {
    setSaveConfirmed(true);

    window.setTimeout(() => {
      setSaveConfirmed(false);
    }, 2500);
  }

  async function handleSave() {
    setSaving(true);
    setNotice('');

    try {
      await saveCurrentMeeting('');
      showSavedConfirmation();
    } catch (error) {
      setNotice(error.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSendToSlack() {
    setSendingSlack(true);
    setNotice('');

    try {
      const savedMeeting = await saveCurrentMeeting('');
      showSavedConfirmation();

      const meetingId = savedMeeting.id || savedMeeting.meeting_id;

      if (!meetingId) {
        throw new Error('Meeting ID is missing. Please save or reopen this meeting before sending to Slack.');
      }

      const result = await sendMeetingToSlack(meetingId);

      setNotice(result?.message || `Sent to ${result?.channel || '#social'}.`);
    } catch (error) {
      setNotice(error.message || 'Failed to send to Slack.');
    } finally {
      setSendingSlack(false);
    }
  }

  async function handleCopyMarkdown() {
    await copyText(markdown);
    setNotice('Markdown copied to clipboard.');
  }

  async function handleCopySlack() {
    await copyText(slackMessage);
    setNotice('Slack-ready message copied to clipboard.');
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <div className="stack no-print">
        <section className="card stack summary-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Editable Result</p>
              <h2>{meeting.title}</h2>
            </div>
            <span className="badge">{meeting.status || 'processed'}</span>
          </div>

          {missingInfoCount > 0 && (
            <p className="warning-banner">
              ⚠ {missingInfoCount} action item{missingInfoCount > 1 ? 's' : ''} missing owner or deadline.
              Review before sharing.
            </p>
          )}

          <label>
            Meeting title
            <input
              value={meeting.title || ''}
              onChange={(event) => setMeeting({ ...meeting, title: event.target.value })}
            />
          </label>

          <label>
            Summary
            <textarea
              rows="5"
              value={meeting.summary || ''}
              onChange={(event) => setMeeting({ ...meeting, summary: event.target.value })}
            />
          </label>
        </section>

        <ActionItemsEditor
          items={meeting.action_items}
          onChange={(action_items) => setMeeting({ ...meeting, action_items })}
        />

        <DecisionsEditor
          decisions={meeting.key_decisions}
          onChange={(key_decisions) => setMeeting({ ...meeting, key_decisions })}
        />

        {meeting.warnings.length > 0 && (
          <section className="card stack">
            <h2>Warnings</h2>
            <ul>
              {meeting.warnings.map((warning, index) => (
                <li key={`${index}-${warning}`}>{warning}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="card stack export-card">
          <div className="save-share-area">
            <div className="save-copy">
              <p>Review complete? Save your edits before sharing.</p>
            </div>

            <button
              type="button"
              className={`save-edits-button ${saveConfirmed ? 'saved' : ''}`}
              onClick={handleSave}
              disabled={saving || sendingSlack}
            >
              {saving ? 'Saving...' : saveConfirmed ? '✓ Edits saved' : 'Save edits'}
            </button>
          </div>

          <div className="export-share-area">
            <div className="export-share-header">
              <div>
                <h2>Export & Share</h2>
                <p>Choose how to share or export the final notes.</p>
              </div>
            </div>

            <div className="export-primary-actions">
              <button
                type="button"
                className="export-primary-button"
                onClick={handleSendToSlack}
                disabled={saving || sendingSlack}
              >
                {sendingSlack ? 'Sending...' : '📤 Send to Slack'}
              </button>

              <button type="button" className="export-primary-button" onClick={handlePrint}>
                🖨 Print / Save PDF
              </button>
            </div>

            <div className="export-secondary-actions">
              <button type="button" className="export-secondary-button" onClick={() => downloadMarkdown(meeting)}>
                Download .md
              </button>

              <button type="button" className="export-secondary-button" onClick={handleCopyMarkdown}>
                Copy Markdown
              </button>

              <button type="button" className="export-secondary-button" onClick={handleCopySlack}>
                Slack Copy
              </button>
            </div>
          </div>

          {notice && <p className="notice">{notice}</p>}

          <pre className="markdown-preview">{markdown}</pre>
        </section>
      </div>

      <article className="print-document print-only">
        <header className="print-report-header">
          <div>
            <p className="print-kicker">KPI Meeting Processor</p>
            <h1>{meeting.title || 'Untitled Meeting'}</h1>
            <p className="print-subtitle">Structured meeting notes generated from transcript.</p>
          </div>

          <div className="print-status-pill">
            {meeting.status || 'Processed'}
          </div>
        </header>

        <section className="print-section print-summary-section">
          <div className="print-section-heading">
            <span>01</span>
            <h2>Summary</h2>
          </div>
          <p>{meeting.summary || '-'}</p>
        </section>

        <section className="print-section">
          <div className="print-section-heading">
            <span>02</span>
            <h2>Action Items</h2>
          </div>

          {meeting.action_items.length === 0 ? (
            <p className="print-muted">No action items found.</p>
          ) : (
            <div className="print-action-list">
              {meeting.action_items.map((item, index) => (
                <div className="print-action-card" key={`${index}-${item.task}`}>
                  <div className="print-action-number">Action {index + 1}</div>

                  <div className="print-action-task">
                    {item.task || 'Untitled task'}
                  </div>

                  <div className="print-action-meta">
                    <div>
                      <span>Owner</span>
                      <strong>{item.owner || 'Not mentioned'}</strong>
                    </div>

                    <div>
                      <span>Deadline</span>
                      <strong>{item.deadline || 'Not mentioned'}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="print-section">
          <div className="print-section-heading">
            <span>03</span>
            <h2>Key Decisions</h2>
          </div>

          {meeting.key_decisions.length === 0 ? (
            <p className="print-muted">No key decisions found.</p>
          ) : (
            <ol className="print-decision-list">
              {meeting.key_decisions.map((decision, index) => (
                <li key={`${index}-${decision}`}>{decision}</li>
              ))}
            </ol>
          )}
        </section>

        {meeting.warnings.length > 0 && (
          <section className="print-section print-warning-section">
            <div className="print-section-heading">
              <span>04</span>
              <h2>Warnings</h2>
            </div>

            <ul className="print-warning-list">
              {meeting.warnings.map((warning, index) => (
                <li key={`${index}-${warning}`}>{warning}</li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}