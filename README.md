# KPI Meeting Processor

A React + Vite internal AI tool built for the KPI Media Junior AI Engineer technical assessment.

The app turns raw meeting transcripts into structured meeting notes, including summaries, action items, key decisions, warnings, editable outputs, export options, saved history, and LLM observability logs.

Live demo: https://kpi-meeting-processor.vercel.app
Repository: https://github.com/Raihanfebrian/kpi-meeting-processor

---

## Overview

KPI Meeting Processor is designed to help teams quickly process meeting transcripts into usable follow-up notes.

Users can paste or upload a `.txt` transcript, process it through an AI workflow, review and edit the generated result, export the notes, and inspect every LLM call through a dedicated logs page.

The tool focuses on three main goals:

1. Reduce the manual work of summarizing meeting transcripts.
2. Make action items and decisions easier to review and share.
3. Provide observability for every AI call, including input, output, model, token usage, latency, and errors.

---

## Features

### Transcript Processing

* Paste raw meeting transcript.
* Upload `.txt` transcript file.
* Add meeting title.
* Generate structured meeting notes using AI.
* Supports Indonesian, English, and mixed-language transcripts.
* Preserves proper names, brand names, campaign names, and technical terms.

### AI-Generated Output

The AI returns structured JSON containing:

* Summary
* Action items
* Owners
* Deadlines
* Key decisions
* Warnings for unclear ownership, unclear deadline, or ambiguous transcript context

### Editable Result

Users can edit the AI output before exporting:

* Edit meeting title
* Edit summary
* Edit action items
* Edit owner and deadline
* Add or remove action items
* Edit key decisions
* Add or remove key decisions
* Save edited result back to Supabase

### Action Item Review UX

The app highlights uncertain AI output:

* `Ready` badge for complete action items
* `Needs review` badge for incomplete action items
* `Owner missing` indicator
* `Deadline missing` indicator
* Warning banner when action items need review

This is useful because meeting transcripts often contain unclear ownership or implied deadlines.

### Export Options

Users can export or share the final notes through:

* Copy Markdown
* Slack-ready copy
* Download `.md`
* Print / Save as PDF

The PDF export uses browser print with print-specific CSS, keeping the document clean and removing sidebar/navigation elements.

### History

The History page stores and displays processed meetings from Supabase.

It includes:

* Total meetings
* Total action items
* Total tokens used
* Average LLM latency
* Search by title or summary
* Clickable meeting detail pages

### LLM Observability

The LLM Logs page shows every AI call stored in Supabase.

It includes:

* Total logs
* Total tokens
* Average latency
* Error count
* Searchable log entries
* Model name
* Input tokens
* Output tokens
* Total tokens
* Latency
* Input messages
* Raw model output
* Parsed output
* Error messages

This makes the tool easier to debug and evaluate as an AI application.

---

## Tech Stack

### Frontend

* React
* Vite
* React Router
* CSS

### Backend Workflow

* n8n on SumoPod
* Production webhook
* HTTP Request node for AI call
* Code nodes for prompt construction, parsing, response shaping, and payload preparation

### AI Provider

* SumoPod AI API
* Model: `gemini/gemini-2.0-flash-lite`

### Database

* Supabase PostgreSQL

Tables:

* `meetings`
* `llm_logs`

### Deployment

* Vercel for frontend
* n8n/SumoPod for backend workflow
* Supabase for persistence and logs

---

## Architecture

```txt
React + Vite Frontend
        |
        v
n8n Production Webhook
        |
        v
Build LLM Request
        |
        v
SumoPod AI API
        |
        v
Parse AI Result
        |
        v
Insert Meeting into Supabase
        |
        v
Insert LLM Log into Supabase
        |
        v
Build Response
        |
        v
React displays editable result
```

---

## n8n Workflow

The n8n workflow contains the following steps:

1. `Webhook`
   Receives meeting title and transcript from the React app.

2. `Build LLM Request`
   Builds the system prompt, user message, model request body, and start timestamp.

3. `Call AI`
   Sends the structured chat completion request to SumoPod AI.

4. `Parse AI Result`
   Parses the model response into JSON and prepares structured meeting output.

5. `Build Meeting Insert Body`
   Creates the Supabase payload for the `meetings` table.

6. `Insert Meeting`
   Stores the processed meeting result in Supabase.

7. `Build LLM Log Insert Body`
   Creates the Supabase payload for the `llm_logs` table.

8. `Insert LLM Log`
   Stores the full AI call log, including prompt, raw output, parsed output, model, tokens, latency, and error details.

9. `Build Response`
   Shapes the response returned to the frontend.

10. `Respond to Webhook`
    Sends the final structured result back to React.

---

## Database Structure

### `meetings`

Stores processed meeting results.

Main fields:

* `id`
* `title`
* `transcript`
* `summary`
* `action_items`
* `key_decisions`
* `warnings`
* `status`
* `created_at`
* `updated_at`
* `edited_at`

### `llm_logs`

Stores observability data for every AI call.

Main fields:

* `id`
* `meeting_id`
* `input_messages`
* `raw_output`
* `parsed_output`
* `model`
* `input_tokens`
* `output_tokens`
* `total_tokens`
* `latency_ms`
* `error_message`
* `created_at`

---

## Environment Variables

Create a `.env` file based on `.env.example`.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
VITE_N8N_WEBHOOK_URL=your_n8n_production_webhook_url
```

Important:

* Do not put the Supabase service role key in the frontend.
* Do not put the SumoPod API key in the frontend.
* Secret keys should stay inside n8n/server-side workflow configuration.

---

## Local Development

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production version:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Deployment

The frontend is deployed on Vercel.

The production app uses:

* Vercel environment variables
* n8n production webhook
* Supabase project URL and publishable key
* Server-side AI call through n8n

---

## Security Notes

The frontend only uses public environment variables required by the browser app.

Sensitive credentials are kept outside the frontend:

* SumoPod AI API key is stored in n8n.
* Supabase service role key is used only in n8n HTTP Request nodes.
* `.env` is excluded from Git through `.gitignore`.

---

## Design Notes

The UI uses KPI Media-inspired branding:

* Deep blue: `#1727AD`
* Yellow: `#FFCC00`
* Light dashboard background
* White rounded cards
* KPI-styled active navigation
* Review badges for incomplete AI output
* Print-specific PDF layout

The design goal is to feel like a lightweight internal AI operations tool rather than a generic demo.

---

## Future Improvements

Given more time, I would improve the tool by adding:

* Slack integration to send final meeting notes directly to a selected channel.
* Authentication and role-based access for real internal usage.
* Better speaker diarization support for transcripts with real speaker names.
* Additional export formats such as `.docx`.
* More advanced prompt evaluation and regression tests.
* A custom backend using Hono or Cloudflare Workers for lower-level control over validation, errors, and latency.
