import { useMemo, useState } from 'react';
import ActionItemsEditor from './ActionItemsEditor.jsx';
import DecisionsEditor from './DecisionsEditor.jsx';
import { buildMarkdown, copyText, downloadMarkdown, safeArray } from '../utils.js';

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

  async function handleCopy() {
    await copyText(markdown);
    setNotice('Markdown copied to clipboard.');
  }

  return (
    <div className="stack">
      <section className="card stack">
        <div className="section-header">
          <div>
            <p className="eyebrow">Editable Result</p>
            <h2>{meeting.title}</h2>
          </div>
          <span className="badge">{meeting.status || 'processed'}</span>
        </div>

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
            <h2>Markdown Export Preview</h2>
            <p>Clean output for Slack, Notion, docs, or submission demo.</p>
          </div>
          <div className="button-row">
            <button type="button" className="secondary" onClick={handleCopy}>Copy</button>
            <button type="button" className="secondary" onClick={() => downloadMarkdown(meeting)}>Download .md</button>
            <button type="button" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save edits'}</button>
          </div>
        </div>
        {notice && <p className="notice">{notice}</p>}
        <pre className="markdown-preview">{markdown}</pre>
      </section>
    </div>
  );
}
