# KPI Meeting Processor

A React + Vite frontend for the KPI Media Junior AI Engineer case study.

## Stack

- React + Vite frontend
- n8n webhook backend for OpenAI processing
- Supabase for meetings and LLM logs
- Vercel deployment

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Fill in:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_N8N_WEBHOOK_URL=
```

4. Run Supabase SQL from `supabase/schema.sql` in Supabase SQL Editor.

5. Start dev server:

```bash
npm run dev
```

## Expected n8n webhook response

The frontend expects the n8n webhook to return:

```json
{
  "meeting_id": "uuid",
  "title": "Meeting title",
  "transcript": "raw transcript",
  "summary": "3-5 sentence summary",
  "action_items": [
    { "task": "", "owner": null, "deadline": null }
  ],
  "key_decisions": [],
  "warnings": []
}
```

## Submission checklist

- Live URL
- GitHub repo link
- Full system prompt
- Screenshot/screen recording of LLM logs page
- Short note covering stack choice, extras, cuts, and future improvements
