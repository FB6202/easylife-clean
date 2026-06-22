import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  readonly themeService = inject(ThemeService);

  readonly currentUser = this.userService.currentUser;
  readonly saving = this.userService.saving;

  // ── UI State ───────────────────────────────────────────
  hasChanges = signal(false);
  saveSuccess = signal(false);
  saveError = signal(false);
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
  zip = signal('');
  city = signal('');
  state = signal('');
  country = signal('');

  // ── Preferences ────────────────────────────────────────
  webColorTheme = signal<ColorTheme>('LIGHT');
  mobileColorTheme = signal<ColorTheme>('SYSTEM');
  language = signal<Language>('EN');
  emailNotifications = signal(false);
  pushNotifications = signal(false);

  // ── Dashboard Widgets ──────────────────────────────────
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

  // ── Static ─────────────────────────────────────────────
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
      popular: false,
      color: '#757575',
      features: ['50 Tasks', '10 Categories', '5 Goals', '500 MB Storage', 'No AI Agent'],
    },
    {
      id: 'PLUS',
      label: 'Plus',
      price: '7.99€',
      period: '/month',
      popular: true,
      color: '#1976d2',
      features: [
        'Unlimited Tasks',
        'Unlimited Categories',
        'Unlimited Goals',
        '10 GB Storage',
        'Basic AI Agent',
        'Network & Following',
      ],
    },
    {
      id: 'PRO',
      label: 'Pro',
      price: '14.99€',
      period: '/month',
      popular: false,
      color: '#9c27b0',
      features: [
        'Everything in Plus',
        '50 GB Storage',
        'Full AI Agent',
        'Priority Support',
        'Early Access Features',
      ],
    },
  ];

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (!user) return;

      this.firstname.set(user.profile?.firstname ?? '');
      this.lastname.set(user.profile?.lastname ?? '');
      this.email.set(user.email ?? '');
      this.bio.set(user.profile?.bio ?? '');
      this.mobileNumber.set(user.profile?.mobileNumber ?? '');

      const addr = user.profile?.address;
      this.street.set(addr?.street ?? '');
      this.zip.set(addr?.zipCode ?? '');
      this.city.set(addr?.city ?? '');
      this.state.set(addr?.state ?? '');
      this.country.set(addr?.country ?? '');

      const s = user.settings;
      if (s) {
        this.webColorTheme.set((s.webColorTheme as ColorTheme) ?? 'LIGHT');
        this.mobileColorTheme.set((s.mobileColorTheme as ColorTheme) ?? 'SYSTEM');
        this.language.set((s.language as Language) ?? 'EN');
        this.emailNotifications.set(s.emailNotifications ?? false);
        this.pushNotifications.set(s.pushNotifications ?? false);
        this.widgetPreferences.update((prefs) =>
          prefs.map((w) => {
            const key =
              `widget${w.id.charAt(0).toUpperCase() + w.id.slice(1)}Enabled` as keyof typeof s;
            return { ...w, enabled: (s[key] as boolean) ?? w.enabled };
          }),
        );
      }

      this.themeService.setTheme(this.webColorTheme());
    });

    if (!this.userService.currentUser()) {
      this.userService.loadById(environment.userId);
    }
  }

  // ── Helpers ────────────────────────────────────────────
  getInitials(): string {
    return (this.firstname().charAt(0) + this.lastname().charAt(0)).toUpperCase() || '?';
  }

  markChanged(): void {
    this.hasChanges.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(false);
  }

  toggleWidgetPreference(id: string): void {
    this.widgetPreferences.update((prefs) =>
      prefs.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)),
    );
    this.markChanged();
  }

  scrollToSection(sectionId: string): void {
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // ── Save / Discard ─────────────────────────────────────
  async onSave(): Promise<void> {
    const user = this.currentUser();
    if (!user) return;

    const w = (id: string) => this.widgetPreferences().find((x) => x.id === id)?.enabled ?? false;

    const [profileOk, addressOk, settingsOk] = await Promise.all([
      this.userService.updateProfile(user.id, {
        firstname: this.firstname(),
        lastname: this.lastname(),
        bio: this.bio(),
        profileImagePath: user.profile?.profileImagePath ?? null,
        mobileNumber: this.mobileNumber(),
      }),
      this.userService.updateAddress(user.id, {
        country: this.country(),
        street: this.street(),
        number: '',
        additionalAddressInfo: '',
        zipCode: this.zip(),
        city: this.city(),
      }),
      this.userService.updateSettings(user.id, {
        language: this.language(),
        webColorTheme: this.webColorTheme(),
        mobileColorTheme: this.mobileColorTheme(),
        emailNotifications: this.emailNotifications(),
        pushNotifications: this.pushNotifications(),
        widgetTasksEnabled: w('tasks'),
        widgetCalendarEnabled: w('calendar'),
        widgetGoalsEnabled: w('goals'),
        widgetWeekplanEnabled: w('weekplan'),
        widgetCategoriesEnabled: w('categories'),
        widgetNotificationsEnabled: w('notifications'),
        widgetJournalEnabled: w('journal'),
        widgetNetworkEnabled: w('network'),
        widgetFollowingEnabled: w('following'),
      }),
    ]);

    if (profileOk && addressOk && settingsOk) {
      this.hasChanges.set(false);
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    } else {
      this.saveError.set(true);
    }
  }

  onDiscard(): void {
    const user = this.currentUser();
    if (!user) return;
    this.firstname.set(user.profile?.firstname ?? '');
    this.lastname.set(user.profile?.lastname ?? '');
    this.bio.set(user.profile?.bio ?? '');
    this.mobileNumber.set(user.profile?.mobileNumber ?? '');
    const addr = user.profile?.address;
    this.street.set(addr?.street ?? '');
    this.zip.set(addr?.zipCode ?? '');
    this.city.set(addr?.city ?? '');
    this.state.set(addr?.state ?? '');
    this.country.set(addr?.country ?? '');
    this.hasChanges.set(false);
    this.saveError.set(false);
  }
}
