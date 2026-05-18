import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  attachments?: AgentAttachment[];
}

export interface AgentAttachment {
  name: string;
  type: string;
  size: number;
  file: File;
}

@Injectable({ providedIn: 'root' })
export class AiAgentService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly isOpen = signal(false);
  readonly isMinimized = signal(false);
  readonly messages = signal<AgentMessage[]>([]);
  readonly isLoading = signal(false);

  readonly conversationId: string;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = sessionStorage.getItem('ai_conversation_id');
      if (stored) {
        this.conversationId = stored;
      } else {
        this.conversationId = crypto.randomUUID();
        sessionStorage.setItem('ai_conversation_id', this.conversationId);
      }
    } else {
      this.conversationId = crypto.randomUUID();
    }

    this.messages.set([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Hey! I\'m your Easy Life assistant. I have access to all your tasks, goals, events, documents and more. How can I help?',
        timestamp: new Date(),
      },
    ]);
  }

  open() {
    this.isOpen.set(true);
    this.isMinimized.set(false);
  }

  close() {
    this.isOpen.set(false);
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  minimize() {
    this.isMinimized.update(v => !v);
  }

  async sendMessage(content: string, attachments: AgentAttachment[] = []) {
    if (!content.trim() && attachments.length === 0) return;

    // Add user message
    const userMsg: AgentMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.isLoading.set(true);

    // Add empty streaming assistant message
    const assistantId = crypto.randomUUID();
    const assistantMsg: AgentMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    this.messages.update(msgs => [...msgs, assistantMsg]);

    try {
      const formData = new FormData();
      formData.append('conversationId', this.conversationId);
      formData.append('message', content.trim());
      attachments.forEach(a => formData.append('files', a.file));

      const response = await fetch('/api/v1/agent/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok || !response.body) {
        throw new Error('Stream failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        this.messages.update(msgs =>
          msgs.map(m =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m,
          ),
        );
      }
    } catch {
      this.messages.update(msgs =>
        msgs.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Something went wrong. Please try again.' }
            : m,
        ),
      );
    } finally {
      this.messages.update(msgs =>
        msgs.map(m =>
          m.id === assistantId ? { ...m, isStreaming: false } : m,
        ),
      );
      this.isLoading.set(false);
    }
  }

  clearHistory() {
    const newId = crypto.randomUUID();
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('ai_conversation_id', newId);
    }
    (this as any).conversationId = newId;
    this.messages.set([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'New conversation started. How can I help?',
        timestamp: new Date(),
      },
    ]);
  }

  formatFileSize(bytes: number): string {
    if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB';
    return (bytes / 1e3).toFixed(0) + ' KB';
  }
}