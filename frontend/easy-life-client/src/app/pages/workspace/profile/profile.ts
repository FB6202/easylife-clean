import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

type ColorTheme = 'LIGHT' | 'DARK' | 'SYSTEM';
type Language = 'DE' | 'EN';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  hasChanges = signal(false);
  showDeleteConfirm = signal(false);

  // Profile
  firstname = signal('Felix');
  lastname = signal('Müller');
  email = signal('felix@easylife.app');
  mobileNumber = signal('');
  bio = signal(
    'Building Easy Life - a productivity suite for intentional people. Passionate about deep work, systems thinking and great software.',
  );
  readonly bioMaxLength = 240;

  // Address
  country = signal('Germany');
  street = signal('Musterstraße');
  number = signal('42');
  additionalInfo = signal('');
  zipCode = signal('40210');
  city = signal('Düsseldorf');

  // Preferences
  webColorTheme = signal<ColorTheme>('LIGHT');
  mobileColorTheme = signal<ColorTheme>('SYSTEM');
  language = signal<Language>('EN');
  emailNotifications = signal(true);
  pushNotifications = signal(false);

  // Security
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  twoFactorEnabled = signal(false);
  sessionTimeout = signal('30');

  // Billing
  readonly currentPlan = signal<'FREE' | 'PLUS' | 'PRO'>('FREE');

  readonly sessionTimeoutOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '240', label: '4 hours' },
    { value: 'never', label: 'Never' },
  ];

  readonly themes: { value: ColorTheme; label: string; icon: string }[] = [
    { value: 'LIGHT', label: 'Light', icon: 'light_mode' },
    { value: 'DARK', label: 'Dark', icon: 'dark_mode' },
    { value: 'SYSTEM', label: 'System', icon: 'brightness_auto' },
  ];

  readonly languages: { value: Language; label: string; flag: string }[] = [
    { value: 'EN', label: 'English', flag: '🇬🇧' },
    { value: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  ];

  readonly plans = [
    {
      id: 'FREE',
      label: 'Free',
      price: '0€',
      period: 'forever',
      features: ['50 Tasks', '10 Categories', '5 Goals', '500 MB Storage', 'No AI Agent'],
      color: '#757575',
      popular: false,
    },
    {
      id: 'PLUS',
      label: 'Plus',
      price: '7.99€',
      period: '/month',
      features: [
        'Unlimited Tasks',
        'Unlimited Categories',
        'Unlimited Goals',
        '10 GB Storage',
        'Basic AI Agent',
        'Network & Following',
      ],
      color: '#1976d2',
      popular: true,
    },
    {
      id: 'PRO',
      label: 'Pro',
      price: '14.99€',
      period: '/month',
      features: [
        'Everything in Plus',
        '50 GB Storage',
        'Full AI Agent',
        'Priority Support',
        'Early Access Features',
      ],
      color: '#9c27b0',
      popular: false,
    },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  getInitials(): string {
    return `${this.firstname().charAt(0)}${this.lastname().charAt(0)}`.toUpperCase();
  }

  markChanged() {
    this.hasChanges.set(true);
  }

  onSave() {
    console.log('Save profile');
    this.hasChanges.set(false);
  }

  onDiscard() {
    this.hasChanges.set(false);
  }

  scrollToSection(sectionId: string) {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}
