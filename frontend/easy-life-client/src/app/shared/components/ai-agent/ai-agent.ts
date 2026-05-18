import {
  Component,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiAgentService, AgentAttachment } from '../../../core/services/ai-agent';

@Component({
  selector: 'app-ai-agent-widget',
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-agent.html',
  styleUrl: './ai-agent.scss',
})
export class AiAgentWidgetComponent implements AfterViewChecked, OnDestroy {
  readonly agent = inject(AiAgentService);

  @ViewChild('messagesEnd') messagesEnd!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  inputText = signal('');
  attachments = signal<AgentAttachment[]>([]);
  isRecording = signal(false);
  private shouldScroll = false;
  private recognition: any = null;

  readonly hasInput = computed(
    () => this.inputText().trim().length > 0 || this.attachments().length > 0,
  );

  readonly canSend = computed(() => this.hasInput() && !this.agent.isLoading());

  // ── Lifecycle ──────────────────────────────────────────
  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy() {
    this.stopRecording();
  }

  private scrollToBottom() {
    this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }

  // ── Send ───────────────────────────────────────────────
  async send() {
    if (!this.canSend()) return;
    const text = this.inputText();
    const files = this.attachments();
    this.inputText.set('');
    this.attachments.set([]);
    this.resetTextareaHeight();
    this.shouldScroll = true;
    await this.agent.sendMessage(text, files);
    this.shouldScroll = true;
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  // ── Textarea auto-grow ─────────────────────────────────
  onInput(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  private resetTextareaHeight() {
    if (this.textareaRef?.nativeElement) {
      this.textareaRef.nativeElement.style.height = 'auto';
    }
  }

  // ── File Attach ────────────────────────────────────────
  openFilePicker() {
    this.fileInput?.nativeElement?.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const newFiles: AgentAttachment[] = Array.from(input.files).map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      file,
    }));
    this.attachments.update(prev => [...prev, ...newFiles].slice(0, 5));
    input.value = '';
  }

  removeAttachment(index: number) {
    this.attachments.update(prev => prev.filter((_, i) => i !== index));
  }

  getFileIcon(type: string): string {
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('image')) return 'image';
    if (type.includes('word') || type.includes('document')) return 'description';
    if (type.includes('sheet') || type.includes('excel')) return 'table_chart';
    return 'attach_file';
  }

  // ── Voice ──────────────────────────────────────────────
  toggleVoice() {
    if (this.isRecording()) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  private startRecording() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    this.recognition = new SR();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = navigator.language || 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript)
        .join('');
      this.inputText.set(transcript);
    };

    this.recognition.onend = () => {
      this.isRecording.set(false);
    };

    this.recognition.onerror = () => {
      this.isRecording.set(false);
    };

    this.recognition.start();
    this.isRecording.set(true);
  }

  private stopRecording() {
    this.recognition?.stop();
    this.isRecording.set(false);
  }

  // ── Helpers ────────────────────────────────────────────
  trackById(index: number, item: { id: string }) {
    return item.id;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}