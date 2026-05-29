import axios from 'axios';
import { supabase } from './supabaseClient';

const n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

export async function processTranscript({ title, transcript }) {
  if (!n8nWebhookUrl) {
    throw new Error('Missing VITE_N8N_WEBHOOK_URL in .env');
  }

  const response = await axios.post(n8nWebhookUrl, { title, transcript }, {
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data;
}

export async function fetchMeetings() {
  const { data, error } = await supabase
    .from('meetings')
    .select('id,title,summary,status,created_at,updated_at,edited_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchMeeting(id) {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMeeting(id, payload) {
  const { data, error } = await supabase
    .from('meetings')
    .update({
      ...payload,
      status: 'edited',
      edited_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function fetchLogs() {
  const { data, error } = await supabase
    .from('llm_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
