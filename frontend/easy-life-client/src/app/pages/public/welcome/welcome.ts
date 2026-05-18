import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-welcome',
  imports: [RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class WelcomeComponent {
  readonly features: Feature[] = [
    {
      icon: 'check_circle',
      title: 'Smart Tasks',
      description: 'Manage tasks with priorities, categories and due dates effortlessly.',
    },
    {
      icon: 'flag',
      title: 'Goal Tracking',
      description: 'Set SMART goals and track progress with detailed milestones.',
    },
    {
      icon: 'calendar_month',
      title: 'Your Calendar',
      description: 'Keep appointments and events organized in one centralized workspace.',
    },
    {
      icon: 'auto_awesome',
      title: 'AI Assistant',
      description: 'Let your personal AI help you plan, reflect and stay on track every day.',
    },
  ];
}
