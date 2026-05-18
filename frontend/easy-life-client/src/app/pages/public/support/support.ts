import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { FooterComponent } from '../../../shared/components/footer/footer';

interface Category {
  icon: string;
  title: string;
  description: string;
  articles: number;
}

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-support',
  imports: [RouterLink, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './support.html',
  styleUrl: './support.scss',
})
export class SupportComponent {
  readonly categories: Category[] = [
    {
      icon: 'rocket_launch',
      title: 'Getting Started',
      description: 'Set up your account, import data and learn the basics.',
      articles: 12,
    },
    {
      icon: 'check_circle',
      title: 'Tasks & Goals',
      description: 'Everything about managing tasks, goals and categories.',
      articles: 18,
    },
    {
      icon: 'calendar_month',
      title: 'Calendar & Events',
      description: 'Scheduling, recurring events and calendar sync.',
      articles: 9,
    },
    {
      icon: 'auto_awesome',
      title: 'AI Assistant',
      description: 'How to use the AI agent and what it can do for you.',
      articles: 7,
    },
    {
      icon: 'payment',
      title: 'Billing & Plans',
      description: 'Subscriptions, upgrades, invoices and cancellations.',
      articles: 11,
    },
    {
      icon: 'security',
      title: 'Privacy & Security',
      description: 'Data protection, account security and privacy settings.',
      articles: 8,
    },
  ];

  faqs = signal<FaqItem[]>([
    {
      question: 'How do I reset my password?',
      answer:
        'Password resets are handled through Keycloak, our authentication provider. Click "Forgot password" on the login page and follow the instructions sent to your email.',
      open: false,
    },
    {
      question: 'Can I use Easy Life on mobile?',
      answer:
        'Yes — Easy Life works great in your mobile browser. A dedicated mobile app is currently in development and will be available soon.',
      open: false,
    },
    {
      question: 'How do I export my data?',
      answer:
        'You can export all your data from your Profile settings. We support JSON and CSV export formats. Your data is always yours.',
      open: false,
    },
    {
      question: 'What is the AI Agent and how does it work?',
      answer:
        'The AI Agent is your personal productivity assistant. It can create tasks, set goals, analyze your week and give you personalized recommendations — all through a natural chat interface.',
      open: false,
    },
    {
      question: 'How do I connect my Google Calendar?',
      answer:
        'Google Calendar integration is coming soon. You will be able to connect it from the Calendar settings page once available.',
      open: false,
    },
    {
      question: 'Is there a limit on how many categories I can create?',
      answer:
        'Free users can create up to 10 categories. Plus and Pro users have unlimited categories. Items can be assigned to up to 5 categories each.',
      open: false,
    },
  ]);

  toggleFaq(index: number) {
    this.faqs.update((items) =>
      items.map((item, i) => ({
        ...item,
        open: i === index ? !item.open : item.open,
      })),
    );
  }
}
