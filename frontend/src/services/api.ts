import type { Project, ContributionVizResponse, ChatMessage, ContactForm, VizMethod } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const api = {
  async getProjects(): Promise<Project[]> {
    return fetchJson<Project[]>('/api/projects');
  },

  async getContributionViz(method: VizMethod): Promise<ContributionVizResponse> {
    return fetchJson<ContributionVizResponse>(`/api/contributions/viz?method=${method}`);
  },

  async sendChatMessage(
    message: string,
    history: ChatMessage[],
    onChunk?: (text: string) => void,
  ): Promise<string> {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    if (!res.ok) throw new Error(`Chat API error: ${res.status}`);

    // Try SSE streaming first
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.content || parsed.text || data;
              fullText += text;
              onChunk?.(fullText);
            } catch {
              fullText += data;
              onChunk?.(fullText);
            }
          }
        }
      }
      return fullText;
    }

    // Fallback: regular JSON response
    const data = await res.json();
    const reply = data.reply || data.content || data.message || '';
    onChunk?.(reply);
    return reply;
  },

  async submitContact(form: ContactForm): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(form),
    });
  },
};
