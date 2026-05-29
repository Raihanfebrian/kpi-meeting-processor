export function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function buildMarkdown(meeting) {
  const actionItems = safeArray(meeting.action_items);
  const decisions = safeArray(meeting.key_decisions);
  const warnings = safeArray(meeting.warnings);

  const actionItemsMarkdown = actionItems.length
    ? actionItems.map((item, index) => {
        const owner = item.owner || 'Unassigned';
        const deadline = item.deadline || 'No deadline mentioned';
        return `${index + 1}. **${item.task || 'Untitled task'}**\n   - Owner: ${owner}\n   - Deadline: ${deadline}`;
      }).join('\n')
    : 'No action items found.';

  const decisionsMarkdown = decisions.length
    ? decisions.map((decision) => `- ${decision}`).join('\n')
    : 'No key decisions found.';

  const warningsMarkdown = warnings.length
    ? `\n## Warnings\n${warnings.map((warning) => `- ${warning}`).join('\n')}\n`
    : '';

  return `# ${meeting.title || 'Untitled Meeting'}\n\nProcessed: ${meeting.created_at ? formatDate(meeting.created_at) : '-'}\n\n## Summary\n${meeting.summary || ''}\n\n## Action Items\n${actionItemsMarkdown}\n\n## Key Decisions\n${decisionsMarkdown}\n${warningsMarkdown}`;
}

export async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

export function downloadMarkdown(meeting) {
  const markdown = buildMarkdown(meeting);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeTitle = (meeting.title || 'meeting-notes').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.href = url;
  link.download = `${safeTitle}.md`;
  link.click();
  URL.revokeObjectURL(url);
}
