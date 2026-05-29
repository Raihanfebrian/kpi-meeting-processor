import { useMemo, useState } from 'react';
import ActionItemsEditor from './ActionItemsEditor.jsx';
import DecisionsEditor from './DecisionsEditor.jsx';
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

  const markdown = useMemo(() => buildMarkdown(meeting), [meeting]);
  const slackMessage = useMemo(() => buildSlackMessage(meeting), [meeting]);

  const missingInfoCount = useMemo(() => {
    return safeArray(meeting.action_items).filter((item) => !item.owner || !item.deadline).length;
  }, [meeting.action_items]);

  async function handleSave() {
    setSaving(true);
    setNotice('');
    try {
      const saved = await onSave({
        title: meeting.title,
        summary: meeting.summary,
        action_items: meeting.action_items,
        key_decisions: meeting.key_decisions,
        warnings: meeting.warnings,
      });
      setMeeting({
        ...saved,
        action_items: safeArray(saved.action_items),
        key_decisions: safeArray(saved.key_decisions),
        warnings: safeArray(saved.warnings),
      });
      setNotice('Saved edited result.');
    } catch (error) {
      setNotice(error.message || 'Failed to save.');
    } finally {
      setSaving(false);
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
              {meeting.warnings.map((warning, index) => <li key={`${index}-${warning}`}>{warning}</li>)}
            </ul>
          </section>
        )}

        <section className="card stack">
          <div className="section-header">
            <div>
              <h2>Export Preview</h2>
              <p>Clean output for Slack, Notion, docs, PDF print, or submission demo.</p>
            </div>
            <div className="button-row">
              <button type="button" className="secondary" onClick={handleCopyMarkdown}>
                Copy Markdown
              </button>
              <button type="button" className="secondary" onClick={handleCopySlack}>
                Slack Copy
              </button>
              <button type="button" className="secondary" onClick={() => downloadMarkdown(meeting)}>
                Download .md
              </button>
              <button type="button" className="secondary" onClick={handlePrint}>
                Print / Save PDF
              </button>
              <button type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save edits'}
              </button>
            </div>
          </div>

          {notice && <p className="notice">{notice}</p>}

          <pre className="markdown-preview">{markdown}</pre>
        </section>
      </div>

      <article className="print-document print-only">
        <header className="print-header">
          <p className="eyebrow">KPI Meeting Processor</p>
          <h1>{meeting.title || 'Untitled Meeting'}</h1>
          <p>Processed meeting notes generated from transcript.</p>
        </header>

        <section>
          <h2>Summary</h2>
          <p>{meeting.summary || '-'}</p>
        </section>

        <section>
          <h2>Action Items</h2>
          {meeting.action_items.length === 0 ? (
            <p>No action items found.</p>
          ) : (
            <table className="print-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Owner</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {meeting.action_items.map((item, index) => (
                  <tr key={`${index}-${item.task}`}>
                    <td>{item.task || 'Untitled task'}</td>
                    <td>{item.owner || 'Not mentioned'}</td>
                    <td>{item.deadline || 'Not mentioned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h2>Key Decisions</h2>
          {meeting.key_decisions.length === 0 ? (
            <p>No key decisions found.</p>
          ) : (
            <ol>
              {meeting.key_decisions.map((decision, index) => (
                <li key={`${index}-${decision}`}>{decision}</li>
              ))}
            </ol>
          )}
        </section>

        {meeting.warnings.length > 0 && (
          <section>
            <h2>Warnings</h2>
            <ul>
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