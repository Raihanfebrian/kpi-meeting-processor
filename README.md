# KPI Meeting Processor

A React + Vite internal AI tool built for the KPI Media Junior AI Engineer technical assessment.

KPI Meeting Processor turns raw meeting transcripts into structured, editable meeting notes. It generates summaries, action items, key decisions, and warnings, then stores the results in Supabase with a dedicated LLM observability layer.

Live demo: https://kpi-meeting-processor.vercel.app
Repository: https://github.com/Raihanfebrian/kpi-meeting-processor

---

## Overview

KPI Meeting Processor is designed to help teams convert raw meeting transcripts into clear follow-up notes faster.

Users can paste a transcript, upload a `.txt` transcript file, process it through an AI workflow, review and edit the generated output, export the result, reopen previous meetings, and inspect every LLM call through a logs page.

The tool focuses on three main goals:

1. Reduce manual effort in summarizing meeting transcripts.
2. Make action items, owners, deadlines, and decisions easier to review.
3. Provide LLM observability for debugging and evaluation.

---

## Key Features

### Transcript Processing

* Paste raw meeting transcripts.
* Upload `.txt` transcript files.
* Add a meeting title.
* Process transcripts through an n8n AI workflow.
* Supports Indonesian, English, and mixed-language transcripts.
* Preserves proper names, brand names, platform names, campaign names, and technical terms.

### Processing Experience

* Custom `.txt` upload component instead of the default browser file input.
* Step-by-step loading indicator while the transcript is being processed.
* Responsive layout for desktop and mobile.
* Fixed KPI-branded top navigation.
* Clean KPI Media-inspired visual design.

### AI-Generated Meeting Notes

The AI returns structured JSON containing:

* Summary
* Action items
* Owners
* Deadlines
* Key decisions
* Warnings for unclear owner, unclear deadline, or ambiguous transcript context

### Editable Output

Users can review and edit the AI-generated result before exporting:

* Edit meeting title.
* Edit summary.
* Edit action item task, owner, and deadline.
* Add or remove action items.
* Edit key decisions.
* Add or remove key decisions.
* Save edited output back to Supabase.

### Action Item Review UX

The app highlights incomplete or uncertain action items:

* `Ready` badge for complete action items.
* `Needs review` badge for incomplete action items.
* `Owner missing` indicator.
* `Deadline missing` indicator.
* Warning banner when generated output needs review.

This helps users avoid blindly trusting AI output when the transcript does not clearly mention an owner or deadline.

### Export Options

Users can export or share the final notes through:

* Copy Markdown
* Slack-ready copy
* Download `.md`
* Print / Save as PDF

The PDF export uses the browser print dialog with print-specific CSS, so the exported document removes navigation elements and keeps the meeting notes clean.

### Meeting History

The History page stores and displays processed meetings from Supabase.

It includes:

* Total meetings
* Total action items
* Total tokens used
* Average LLM latency
* Search by meeting title or summary
* Clickable meeting detail pages

### LLM Observability

The LLM Logs page stores and displays every AI call.

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

This makes the tool easier to debug, evaluate, and explain as an AI application.

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
* HTTP Request node for the AI call
* Code nodes for prompt construction, response parsing, payload preparation, and response shaping

### AI Provider

* SumoPod AI API
* Model: `gemini/gemini-2.0-flash-lite`

### Database

* Supabase PostgreSQL

Main tables:

* `meetings`
* `llm_logs`

### Deployment

* Vercel for frontend deployment
* n8n/SumoPod for backend workflow
* Supabase for persistence and observability logs

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
   Receives the meeting title and transcript from the React app.

2. `Build LLM Request`
   Builds the system prompt, user message, model request body, and start timestamp.

3. `Call AI`
   Sends the structured chat completion request to the SumoPod AI API.

4. `Parse AI Result`
   Cleans the raw model response, removes markdown code fence wrappers when present, parses the response into JSON, and prepares the structured meeting output.

5. `Build Meeting Insert Body`
   Creates the Supabase payload for the `meetings` table.

6. `Insert Meeting`
   Stores the processed meeting result in Supabase.

7. `Build LLM Log Insert Body`
   Creates the Supabase payload for the `llm_logs` table.

8. `Insert LLM Log`
   Stores the full AI call log, including input messages, raw output, parsed output, model, token usage, latency, and error details.

9. `Build Response`
   Shapes the final response returned to the frontend.

10. `Respond to Webhook`
    Sends the structured result back to React.

---

## Database Structure

### `meetings`

Stores processed meeting notes.

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

Important notes:

* Do not put the Supabase service role key in the frontend.
* Do not put the SumoPod AI API key in the frontend.
* Secret keys should stay inside n8n or another server-side environment.
* `.env` is excluded from Git through `.gitignore`.

---

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```

Preview the production build locally:

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
* Supabase service role key is used only inside n8n HTTP Request nodes.
* `.env` is excluded from Git.
* The frontend never directly calls the AI provider.

---

## Design Notes

The UI uses KPI Media-inspired branding:

* Deep blue: `#1727AD`
* Yellow: `#FFCC00`
* Light dashboard background
* White rounded cards
* Fixed KPI-branded top navigation
* Yellow active navigation state
* Custom `.txt` upload component
* Step-by-step processing indicator
* Review badges for incomplete AI output
* Print-specific PDF layout

The design goal is to make the tool feel like a lightweight internal AI operations product rather than a generic demo. The fixed top navigation keeps the app compact and gives more horizontal space to the Process, History, and LLM Logs pages.

---

## Prompt Behavior

The system prompt is designed to:

* Return only valid JSON.
* Keep the output in the same main language as the transcript.
* Preserve names, brands, platforms, campaign names, and technical terms.
* Separate summaries, action items, key decisions, and warnings.
* Avoid inventing owners, deadlines, decisions, or context.
* Assign owners and deadlines conservatively.
* Add warnings when ownership, deadlines, or transcript context are unclear.

This approach makes the AI output easier to review and safer to use in real meeting workflows.

---

## What I Added Beyond the Core Requirements

* KPI Media-inspired visual branding.
* Fixed top navigation.
* Custom transcript upload UI.
* Step-by-step processing state.
* Editable AI-generated output.
* Action item readiness badges.
* Warning indicators for unclear owner/deadline.
* Slack-ready copy output.
* Browser-based Print / Save as PDF.
* Searchable meeting history.
* History stats dashboard.
* Searchable LLM logs.
* Token, latency, model, raw output, parsed output, and error logging.

---

## Future Improvements

Given more time, I would improve the tool by adding:

* Slack integration to send final meeting notes directly to a selected channel.
* Authentication and role-based access for real internal usage.
* Better speaker diarization support for transcripts with real speaker names.
* Additional export formats such as `.docx`.
* More advanced prompt evaluation and regression tests.
* A custom backend using Hono or Cloudflare Workers for more granular validation, error handling, and latency control.
