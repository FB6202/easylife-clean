import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, ColorTheme } from '../../../core/services/theme';

type Language = 'DE' | 'EN';

interface UserSettings {
  language: Language;
  webColorTheme: ColorTheme;
  mobileColorTheme: ColorTheme;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

@Component({
  selector: 'app-settings-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings-modal.html',
  styleUrl: './settings-modal.scss'
})
export class SettingsModalComponent {

  readonly close = output<void>();
  readonly save = output<UserSettings>();
  readonly navigateTo = output<{ path: string; section?: string }>();

  readonly settings = signal<UserSettings>({
    language: 'EN',
    webColorTheme: 'LIGHT',
    mobileColorTheme: 'SYSTEM',
    emailNotifications: true,
    pushNotifications: false,
  });

  readonly themes: { value: ColorTheme; label: string; icon: string }[] = [
    { value: 'LIGHT', label: 'Light', icon: 'light_mode' },
    { value: 'DARK', label: 'Dark', icon: 'dark_mode' },
    { value: 'SYSTEM', label: 'System', icon: 'brightness_auto' },
  ];

  readonly languages: { value: Language; label: string; flag: string }[] = [
    { value: 'EN', label: 'English', flag: '🇬🇧' },
    { value: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  ];

  constructor(private themeService: ThemeService) {
    this.settings.update(s => ({
      ...s,
      webColorTheme: this.themeService.currentTheme()
    }));
  }

  setWebTheme(theme: ColorTheme) {
    this.settings.update(s => ({ ...s, webColorTheme: theme }));
    this.themeService.setTheme(theme);
  }

  setMobileTheme(theme: ColorTheme) {
    this.settings.update(s => ({ ...s, mobileColorTheme: theme }));
  }

  setLanguage(lang: Language) {
    this.settings.update(s => ({ ...s, language: lang }));
  }

  toggleEmail() {
    this.settings.update(s => ({ ...s, emailNotifications: !s.emailNotifications }));
  }

  togglePush() {
    this.settings.update(s => ({ ...s, pushNotifications: !s.pushNotifications }));
  }

  onSave() {
    this.save.emit(this.settings());
    this.close.emit();
  }

  onClose() { this.close.emit(); }
  onEditProfile() { this.navigateTo.emit({ path: 'profile', section: 'section-profile' }); }
  onSecurity() { this.navigateTo.emit({ path: 'profile', section: 'section-security' }); }
  onBilling() { this.navigateTo.emit({ path: 'profile', section: 'section-billing' }); }
}