export default function ActionItemsEditor({ items, onChange }) {
  function updateItem(index, field, value) {
    const next = items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value || null } : item
    ));
    onChange(next);
  }

  function addItem() {
    onChange([...items, { task: '', owner: null, deadline: null }]);
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
        <button type="button" className="secondary" onClick={addItem}>+ Add item</button>
      </div>

      {items.length === 0 && <p className="muted">No action items yet.</p>}

      <div className="action-list">
        {items.map((item, index) => (
          <div className="action-card" key={`${index}-${item.task}`}>
            <label>
              Task
              <textarea
                value={item.task || ''}
                rows="2"
                onChange={(event) => updateItem(index, 'task', event.target.value)}
              />
            </label>
            <div className="grid-2">
              <label>
                Owner
                <input
                  value={item.owner || ''}
                  placeholder="Unassigned"
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
            <button type="button" className="danger ghost" onClick={() => removeItem(index)}>Remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}
