export default function DecisionsEditor({ decisions, onChange }) {
  function updateDecision(index, value) {
    const next = decisions.map((decision, decisionIndex) => (
      decisionIndex === index ? value : decision
    ));
    onChange(next);
  }

  function addDecision() {
    onChange([...decisions, '']);
  }

  function removeDecision(index) {
    onChange(decisions.filter((_, decisionIndex) => decisionIndex !== index));
  }

  return (
    <section className="card stack">
      <div className="section-header">
        <div>
          <h2>Key Decisions</h2>
          <p>Keep decisions separate from action items.</p>
        </div>
        <button type="button" className="secondary" onClick={addDecision}>+ Add decision</button>
      </div>

      {decisions.length === 0 && <p className="muted">No key decisions yet.</p>}

      <div className="stack small-gap">
        {decisions.map((decision, index) => (
          <div className="inline-row" key={`${index}-${decision}`}>
            <input
              value={decision || ''}
              onChange={(event) => updateDecision(index, event.target.value)}
              placeholder="Decision made in the meeting"
            />
            <button type="button" className="danger ghost" onClick={() => removeDecision(index)}>Remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}
