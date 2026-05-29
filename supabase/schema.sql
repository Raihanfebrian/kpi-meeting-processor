-- Enable UUID generation
create extension if not exists "pgcrypto";

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  transcript text not null,
  summary text not null default '',
  action_items jsonb not null default '[]'::jsonb,
  key_decisions jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  status text not null default 'processed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists public.llm_logs (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references public.meetings(id) on delete set null,
  input_messages jsonb not null,
  raw_output text,
  parsed_output jsonb,
  model text not null,
  input_tokens int default 0,
  output_tokens int default 0,
  total_tokens int default 0,
  latency_ms int default 0,
  error_message text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_meetings_updated_at on public.meetings;
create trigger set_meetings_updated_at
before update on public.meetings
for each row
execute procedure public.set_updated_at();

-- For a take-home demo, these permissive RLS policies make frontend reads/updates simple.
-- Never expose the Supabase service role key in React.
alter table public.meetings enable row level security;
alter table public.llm_logs enable row level security;

drop policy if exists "Allow public read meetings" on public.meetings;
create policy "Allow public read meetings" on public.meetings
for select using (true);

drop policy if exists "Allow public update meetings" on public.meetings;
create policy "Allow public update meetings" on public.meetings
for update using (true) with check (true);

drop policy if exists "Allow public read logs" on public.llm_logs;
create policy "Allow public read logs" on public.llm_logs
for select using (true);
