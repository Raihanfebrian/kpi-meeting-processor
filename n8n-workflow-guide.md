# n8n Workflow Guide

## Goal

React sends `{ title, transcript }` to n8n. n8n calls OpenAI, parses the JSON result, inserts the meeting into Supabase, inserts an LLM log row into Supabase, then returns the saved meeting to React.

## System Prompt

```text
You are a meeting notes processor for an internal performance marketing agency tool.

Given a raw meeting transcript, extract useful meeting notes and return ONLY a valid JSON object with this exact structure:

{
  "summary": "3-5 sentence summary of what the meeting was about and what was decided",
  "action_items": [
    {
      "task": "description of the task",
      "owner": "name of person responsible, or null if not mentioned",
      "deadline": "deadline if mentioned, or null if not mentioned"
    }
  ],
  "key_decisions": [
    "decision 1",
    "decision 2"
  ],
  "warnings": [
    "short warning if owner/deadline/decision is ambiguous"
  ]
}

Rules:
- Return ONLY the JSON. No explanation, no markdown, no backticks.
- Summary must be 3-5 sentences maximum.
- Action items should usually be 3-8 items, but return fewer if the transcript contains fewer real tasks.
- Key decisions should usually be 1-4 items, but return an empty array if no explicit decision was made.
- If owner is not mentioned, set owner to null.
- If deadline is not mentioned, set deadline to null.
- Do not invent names, deadlines, tasks, or decisions.
- Prefer exact wording from the transcript for owners and deadlines.
- Add warnings only when something is ambiguous or inferred.
```

## Suggested Node Flow

1. **Webhook**
   - Method: POST
   - Path: `process-meeting`
   - Body contains `title` and `transcript`

2. **Set: Start Metadata**
   - `started_at`: `{{ Date.now() }}`
   - `title`: `{{ $json.body.title }}`
   - `transcript`: `{{ $json.body.transcript }}`

3. **OpenAI Chat Model / HTTP Request to OpenAI**
   - Model: `gpt-4o-mini` or similar affordable model
   - System message: use the system prompt above
   - User message:

```text
Meeting title: {{$json.title}}

Raw transcript:
{{$json.transcript}}
```

4. **Set: Parse + Metrics**
   - `ended_at`: `{{ Date.now() }}`
   - `latency_ms`: `{{ Number($json.ended_at) - Number($json.started_at) }}`
   - `raw_output`: OpenAI response text
   - `parsed_output`: parsed JSON from raw output
   - `input_tokens`, `output_tokens`, `total_tokens`: map from OpenAI usage fields

5. **Supabase: Insert Meeting**
   - Table: `meetings`
   - Insert:
     - title
     - transcript
     - summary: `parsed_output.summary`
     - action_items: `parsed_output.action_items`
     - key_decisions: `parsed_output.key_decisions`
     - warnings: `parsed_output.warnings`
     - status: `processed`

6. **Supabase: Insert LLM Log**
   - Table: `llm_logs`
   - Insert:
     - meeting_id from inserted meeting
     - input_messages
     - raw_output
     - parsed_output
     - model
     - input_tokens
     - output_tokens
     - total_tokens
     - latency_ms
     - error_message if any

7. **Respond to Webhook**
   - Return the inserted meeting row:

```json
{
  "id": "meeting uuid",
  "title": "title",
  "transcript": "raw transcript",
  "summary": "summary",
  "action_items": [],
  "key_decisions": [],
  "warnings": [],
  "status": "processed",
  "created_at": "timestamp"
}
```

## Important

- Keep OpenAI API key inside n8n credentials only.
- Do not expose Supabase service role key in React.
- Use the `/logs` page in React for the required observability screenshot.
