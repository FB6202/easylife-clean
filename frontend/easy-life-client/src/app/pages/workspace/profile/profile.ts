import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user-service';
import { ThemeService } from '../../../core/services/theme';
import { environment } from '../../../../environments/environment';

type ColorTheme = 'LIGHT' | 'DARK' | 'SYSTEM';
type Language = 'DE' | 'EN';

interface WidgetPreference {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  private readonly userService = inject(UserService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  hasChanges = signal(false);
  showDeleteConfirm = signal(false);

  // ── Profile ────────────────────────────────────────────
  firstname = signal('');
  lastname = signal('');
  email = signal('');
  bio = signal('');
  mobileNumber = signal('');
  readonly bioMaxLength = 240;

  // ── Address ────────────────────────────────────────────
  street = signal('');
  city = signal('');
  state = signal('');
  country = signal('');
  zip = signal('');

  // ── Preferences ────────────────────────────────────────
  webColorTheme = signal<ColorTheme>('LIGHT');
  mobileColorTheme = signal<ColorTheme>('SYSTEM');
  language = signal<Language>('EN');
  emailNotifications = signal(false);
  pushNotifications = signal(false);

  // ── Dashboard Widget Preferences ───────────────────────
  widgetPreferences = signal<WidgetPreference[]>([
    { id: 'tasks', label: 'Daily Actions', icon: 'check_circle', enabled: true },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_month', enabled: true },
    { id: 'goals', label: 'Goals', icon: 'flag', enabled: true },
    { id: 'weekplan', label: 'My Week', icon: 'view_week', enabled: true },
    { id: 'categories', label: 'Categories', icon: 'category', enabled: true },
    { id: 'notifications', label: 'Notifications', icon: 'notifications', enabled: true },
    { id: 'journal', label: 'Journal', icon: 'menu_book', enabled: false },
    { id: 'network', label: 'People', icon: 'people', enabled: false },
    { id: 'following', label: 'Network', icon: 'person_add', enabled: false },
  ]);

  // ── Security ───────────────────────────────────────────
  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');
  twoFactorEnabled = signal(false);
  sessionTimeout = signal('30');

  // ── Billing ────────────────────────────────────────────
  readonly currentPlan = signal<'FREE' | 'PLUS' | 'PRO'>('FREE');

  // ── Static Options ─────────────────────────────────────
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

  constructor() {
    // User-Daten in Form-Signals übertragen sobald geladen
    effect(() => {
      const user = this.userService.currentUser();
      if (!user) return;

      // Profile
      this.firstname.set(user.profile?.firstname ?? '');
      this.lastname.set(user.profile?.lastname ?? '');
      this.email.set(user.email ?? '');
      this.bio.set(user.profile?.bio ?? '');
      this.mobileNumber.set(user.profile?.mobileNumber ?? '');

      // Address
      const addr = user.profile?.address;
      this.street.set(addr?.street ?? '');
      this.city.set(addr?.city ?? '');
      this.state.set(addr?.state ?? '');
      this.country.set(addr?.country ?? '');
      this.zip.set(addr?.zip ?? '');

      // Settings
      const settings = user.settings;
      if (settings) {
        const theme = settings.theme as ColorTheme;
        this.webColorTheme.set(theme ?? 'LIGHT');
        this.language.set((settings.language as Language) ?? 'EN');
        this.emailNotifications.set(settings.notifications ?? false);

        // Widget Preferences aus Settings laden
        this.widgetPreferences.update((prefs) =>
          prefs.map((w) => {
            const settingsKey = `widget${w.id.charAt(0).toUpperCase() + w.id.slice(1)}Enabled`;
            const enabledInSettings = (settings as any)[settingsKey];
            return { ...w, enabled: enabledInSettings ?? w.enabled };
          }),
        );
      }

      // Theme auch im ThemeService syncen
      this.themeService.setTheme(this.webColorTheme());
    });

    // Falls User noch nicht geladen
    if (!this.userService.currentUser()) {
      this.userService.loadById(environment.userId);
    }
  }

  // ── Helpers ────────────────────────────────────────────
  getInitials(): string {
    const f = this.firstname().charAt(0);
    const l = this.lastname().charAt(0);
    return (f + l).toUpperCase() || '?';
  }

  markChanged(): void {
    this.hasChanges.set(true);
  }

  onSave(): void {
    // TODO: userService.updateProfile() + updateAddress() + updateSettings() + updateWidgetPreferences()
    console.log('TODO save profile');
    this.hasChanges.set(false);
  }

  onDiscard(): void {
    // Felder aus User zurücksetzen
    const user = this.userService.currentUser();
    if (user) {
      this.firstname.set(user.profile?.firstname ?? '');
      this.lastname.set(user.profile?.lastname ?? '');
      this.bio.set(user.profile?.bio ?? '');
      const addr = user.profile?.address;
      this.street.set(addr?.street ?? '');
      this.city.set(addr?.city ?? '');
      this.state.set(addr?.state ?? '');
      this.country.set(addr?.country ?? '');
      this.zip.set(addr?.zip ?? '');
    }
    this.hasChanges.set(false);
  }

  setWebTheme(theme: ColorTheme): void {
    this.webColorTheme.set(theme);
    this.themeService.setTheme(theme);
    this.markChanged();
  }

  toggleWidgetPreference(id: string): void {
    this.widgetPreferences.update((prefs) =>
      prefs.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)),
    );
    this.markChanged();
  }

  scrollToSection(sectionId: string): void {
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }
}
