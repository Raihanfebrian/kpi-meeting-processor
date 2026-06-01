# KPI Meeting Processor

A React + Vite internal AI tool built for the KPI Media Junior AI Engineer technical assessment.

KPI Meeting Processor turns raw meeting transcripts into structured, editable meeting notes. It generates summaries, action items, key decisions, and warnings, then stores the results in Supabase with a dedicated LLM observability layer and direct Slack delivery.

Live demo: https://kpi-meeting-processor.vercel.app
Repository: https://github.com/Raihanfebrian/kpi-meeting-processor

---

## Overview

KPI Meeting Processor is designed to help teams convert raw meeting transcripts into clear follow-up notes faster.

Users can paste a transcript, upload a `.txt` transcript file, process it through an AI workflow, review and edit the generated output, export the result, send the final notes to Slack, reopen previous meetings, and inspect every LLM call through a logs page.

The tool focuses on four main goals:

1. Reduce manual effort in summarizing meeting transcripts.
2. Make action items, owners, deadlines, and decisions easier to review.
3. Reduce friction in sharing meeting notes to Slack.
4. Provide LLM observability for debugging and evaluation.

---

## Key Features

### Transcript Processing

* Paste raw meeting transcripts.
* Upload `.txt` transcript files.
* Add a meeting title.
* Process transcripts through an n8n AI workflow.
* Supports clear named-speaker transcripts and generic audio transcripts such as `Speaker 1`, `Speaker 2`, and `Speaker 3`.
* Preserves proper names, speaker labels, brand names, platform names, campaign names, and technical terms.

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
* Warnings for unclear owner, unclear deadline, unclear speaker identity, or ambiguous transcript context

### Editable Output

Users can review and edit the AI-generated result before exporting or sharing:

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

This is useful because real meeting transcripts often contain unclear ownership, implied deadlines, or generic speaker labels.

### Export and Share

Users can export or share final notes through:

* Direct Send to Slack
* Print / Save as PDF
* Download `.md`
* Copy Markdown
* Slack-ready copy

The export section is organized by priority:

* Save edits first.
* Primary share/export actions: Send to Slack and Print / Save PDF.
* Secondary export actions: Download `.md`, Copy Markdown, and Slack Copy.

### Direct Slack Integration

The app includes a direct Send to Slack flow using a dedicated n8n workflow.

Flow:

```txt
React
  |
  v
n8n Slack webhook
  |
  v
Fetch meeting from Supabase
  |
  v
Format Slack Block Kit payload
  |
  v
Slack Incoming Webhook
  |
  v
Message appears in Slack channel
```

The Slack Incoming Webhook URL is stored only inside n8n. The frontend only calls the n8n proxy webhook, so the Slack secret is never exposed in React, GitHub, or Vercel.

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
* Code nodes for prompt construction, response parsing, payload preparation, response shaping, and Slack payload formatting

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
* n8n/SumoPod for backend workflows
* Supabase for persistence and observability logs
* Slack Incoming Webhook for direct Slack delivery

---

## Architecture

```txt
React + Vite Frontend
        |
        v
n8n Processing Webhook
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

Slack sharing uses a separate workflow:

```txt
React Send to Slack Button
        |
        v
n8n Slack Webhook
        |
        v
Fetch Meeting from Supabase
        |
        v
Format Slack Block Kit Payload
        |
        v
Send to Slack Incoming Webhook
        |
        v
Return Success Response to React
```

The processing workflow and Slack workflow are intentionally separated. This keeps the core meeting processing flow stable even if Slack delivery fails.

---

## n8n Processing Workflow

The main n8n workflow contains the following steps:

1. `Webhook`
   Receives the meeting title and transcript from the React app.

2. `Build LLM Request`
   Builds the system prompt, user message, model request body, detected output language, and start timestamp.

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

## n8n Slack Workflow

The Slack workflow is separate from the main processing workflow.

It contains the following steps:

1. `Webhook`
   Receives a `meeting_id` from the React app.

2. `Get Meeting from Supabase`
   Fetches the saved meeting data from the `meetings` table.

3. `Format Slack Payload`
   Converts the meeting note into Slack Block Kit format.

4. `Send to Slack`
   Sends the formatted message to Slack using an Incoming Webhook.

5. `Build Response`
   Creates a clean success response for the frontend.

6. `Respond to Webhook`
   Returns the Slack delivery status to React.

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

## Prompt Behavior

The system prompt is designed to:

* Return only valid JSON.
* Write output in the detected dominant language of the transcript.
* Preserve names, speaker labels, brands, platforms, campaign names, and technical terms.
* Separate summaries, action items, key decisions, and warnings.
* Avoid inventing owners, deadlines, decisions, or context.
* Assign owners and deadlines conservatively.
* Use generic speaker labels such as `Speaker 1` only when the transcript does not provide a reliable real name.
* Add warnings when ownership, deadlines, speaker identity, or transcript context are unclear.

This approach makes the AI output easier to review and safer to use in real meeting workflows.

---

## Demo Scenarios

The demo data is intentionally seeded with different transcript patterns:

1. **Clear campaign planning meeting**
   Shows the happy path with named speakers, clear owners, clear deadlines, and multiple decisions.

2. **Pure audio transcript with speaker labels only**
   Shows how the tool handles realistic audio transcripts using `Speaker 1`, `Speaker 2`, and `Speaker 3`.

3. **Ambiguous and decision-heavy strategy meeting**
   Shows conservative extraction behavior when some tasks do not have clear owners or deadlines.

These demo scenarios are designed to show both the strengths and realistic limitations of an AI meeting workflow.

---

## Environment Variables

Create a `.env` file based on `.env.example`.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
VITE_N8N_WEBHOOK_URL=your_n8n_processing_webhook_url
VITE_SLACK_SEND_WEBHOOK_URL=your_n8n_slack_proxy_webhook_url
```

Important notes:

* Do not put the Supabase service role key in the frontend.
* Do not put the SumoPod AI API key in the frontend.
* Do not put the Slack Incoming Webhook URL in the frontend.
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
* n8n production webhook for transcript processing
* n8n production webhook for Slack delivery
* Supabase project URL and publishable key
* Server-side AI call through n8n
* Server-side Slack delivery through n8n

---

## Security Notes

The frontend only uses public environment variables required by the browser app.

Sensitive credentials are kept outside the frontend:

* SumoPod AI API key is stored in n8n.
* Supabase service role key is used only inside n8n HTTP Request nodes.
* Slack Incoming Webhook URL is stored only inside n8n.
* `.env` is excluded from Git.
* The frontend never directly calls the AI provider.
* The frontend never directly calls Slack.

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
* Prioritized Export & Share section
* Print-specific PDF report layout

The design goal is to make the tool feel like a lightweight internal AI operations product rather than a generic demo.

---

## What I Added Beyond the Core Requirements

* KPI Media-inspired visual branding.
* Fixed top navigation.
* Custom transcript upload UI.
* Step-by-step processing state.
* Editable AI-generated output.
* Action item readiness badges.
* Warning indicators for unclear owner, deadline, or speaker identity.
* Slack-ready copy output.
* Direct Send to Slack integration.
* Browser-based Print / Save as PDF with improved report layout.
* Searchable meeting history.
* History stats dashboard.
* Searchable LLM logs.
* Token, latency, model, raw output, parsed output, and error logging.
* Demo data covering clear, speaker-label, and ambiguous transcript scenarios.

---

## Tradeoffs

### Direct LLM Call Instead of AI Agent

I intentionally used a direct structured LLM call instead of an AI Agent for the core transcript processing because the task requires predictable JSON, low latency, and easier debugging.

An AI Agent would be more useful in a future version for cross-meeting search, follow-up detection, or querying historical meeting data with tools and memory.

### Slack Incoming Webhook Instead of Full Slack OAuth

I used Slack Incoming Webhook because it directly solves the main pain point: sending meeting notes to Slack without manual copy-paste.

A full Slack app with OAuth would allow dynamic channel selection and user mentions, but it would also add token management, OAuth callbacks, scopes, and more operational complexity. For this assessment version, a fixed Slack channel through n8n is the right tradeoff.

### Browser Print Instead of Server-Side PDF

The PDF export uses the browser print dialog because it avoids adding extra PDF generation infrastructure while still allowing users to save a clean PDF report.

A production version could add server-side PDF generation for more consistent formatting across browsers.

---

## Future Improvements

Given more time, I would improve the tool by adding:

* Speaker mapping UI, for example `Speaker 1 → Sarah`.
* Slack channel selection from the UI using full Slack OAuth.
* Authentication and role-based access for real internal usage.
* Better speaker diarization support for transcripts with real speaker names.
* Additional export formats such as `.docx`.
* Task status tracking and follow-up reminders.
* Calendar-aware deadline extraction.
* AI-powered search across previous meetings.
* More advanced prompt evaluation and regression tests.
* A custom backend using Hono or Cloudflare Workers for more granular validation, error handling, and latency control.
