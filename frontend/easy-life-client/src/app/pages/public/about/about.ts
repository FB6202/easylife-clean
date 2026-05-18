import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { FooterComponent } from '../../../shared/components/footer/footer';

interface Value {
  icon: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  imports: [RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutComponent {
  readonly stats: Stat[] = [
    { value: '5+', label: 'Ways to organize your life', icon: 'grid_view' },
    { value: '1', label: 'Place for everything', icon: 'hub' },
    { value: '∞', label: 'Possibilities with AI', icon: 'auto_awesome' },
    { value: '0', label: 'Reasons to use five apps', icon: 'close' },
  ];

  readonly values: Value[] = [
    {
      icon: 'lightbulb',
      title: 'Simplicity first',
      description:
        'Productivity tools should get out of your way. Easy Life is designed to feel natural from day one — no manual needed.',
    },
    {
      icon: 'lock',
      title: 'Your data, your rules',
      description:
        'Everything you create belongs to you. We never sell your data and you can export or delete everything at any time.',
    },
    {
      icon: 'auto_awesome',
      title: 'AI as a partner',
      description:
        'We see AI not as a replacement for human thinking, but as a thoughtful partner that helps you reflect, plan and grow.',
    },
    {
      icon: 'favorite',
      title: 'Built with care',
      description:
        'Easy Life is built by two brothers who use it every single day. Every feature exists because we needed it ourselves.',
    },
  ];
}
