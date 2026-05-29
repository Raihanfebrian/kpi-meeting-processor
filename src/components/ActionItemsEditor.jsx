function normalizeMissing(value) {
  if (!value) return true;

  const text = String(value).trim().toLowerCase();

  return (
    text === 'unassigned' ||
    text === 'not mentioned' ||
    text === 'no deadline mentioned' ||
    text === 'null' ||
    text === '-'
  );
}

export default function ActionItemsEditor({ items, onChange }) {
  function updateItem(index, field, value) {
    const next = items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    ));

    onChange(next);
  }

  function addItem() {
    onChange([
      ...items,
      {
        task: '',
        owner: '',
        deadline: '',
      },
    ]);
  }

  function removeItem(index) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <section className="card stack">
      <div className="section-header">
        <div>
          <h2>Action Items</h2>
          <p>Edit task, owner, and deadline before exporting.</p>
        </div>

        <button type="button" className="secondary" onClick={addItem}>
          + Add item
        </button>
      </div>

      {items.length === 0 ? (
        <p className="muted">No action items found.</p>
      ) : (
        <div className="action-list">
          {items.map((item, index) => {
            const ownerMissing = normalizeMissing(item.owner);
            const deadlineMissing = normalizeMissing(item.deadline);
            const needsReview = ownerMissing || deadlineMissing;

            return (
              <article className={`action-card ${needsReview ? 'needs-review' : 'ready'}`} key={index}>
                <div className="action-card-top">
                  <div>
                    <p className="action-number">Action item {index + 1}</p>
                    <h3>{item.task || 'Untitled task'}</h3>
                  </div>

                  <div className="action-badges">
                    <span className={`status-pill ${needsReview ? 'review' : 'ready'}`}>
                      {needsReview ? 'Needs review' : 'Ready'}
                    </span>
                  </div>
                </div>

                {needsReview && (
                  <div className="mini-warning-row">
                    {ownerMissing && <span>Owner missing</span>}
                    {deadlineMissing && <span>Deadline missing</span>}
                  </div>
                )}

                <label>
                  Task
                  <textarea
                    rows="2"
                    value={item.task || ''}
                    onChange={(event) => updateItem(index, 'task', event.target.value)}
                  />
                </label>

                <div className="grid-2">
                  <label>
                    Owner
                    <input
                      value={item.owner || ''}
                      placeholder="Not mentioned"
                      onChange={(event) => updateItem(index, 'owner', event.target.value)}
                    />
                  </label>

                  <label>
                    Deadline
                    <input
                      value={item.deadline || ''}
                      placeholder="No deadline mentioned"
                      onChange={(event) => updateItem(index, 'deadline', event.target.value)}
                    />
                  </label>
                </div>

                <div className="action-footer">
                  <button type="button" className="ghost danger" onClick={() => removeItem(index)}>
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}