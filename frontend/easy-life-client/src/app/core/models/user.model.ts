export interface AddressResponse {
  id: number;
  street: string | null;
  number: string | null;
  additionalAddressInfo: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
}

export interface ProfileResponse {
  id: number;
  firstname: string | null;
  lastname: string | null;
  profileImagePath: string | null;
  bio: string | null;
  mobileNumber: string | null;
  address: AddressResponse | null;
}

export interface SettingsResponse {
  id: number;
  language: string;
  webColorTheme: string;
  mobileColorTheme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  widgetTasksEnabled: boolean;
  widgetCalendarEnabled: boolean;
  widgetGoalsEnabled: boolean;
  widgetWeekplanEnabled: boolean;
  widgetCategoriesEnabled: boolean;
  widgetNotificationsEnabled: boolean;
  widgetJournalEnabled: boolean;
  widgetNetworkEnabled: boolean;
  widgetFollowingEnabled: boolean;
}

export interface UserResponse {
  id: number;
  keycloakId: string | null;
  username: string;
  email: string;
  locked: boolean;
  emailVerified: boolean;
  createdAt: string;
  profile: ProfileResponse | null;
  settings: SettingsResponse | null;
}

export interface UserSearchResponse {
  id: number;
  username: string;
  firstname: string | null;
  lastname: string | null;
  profileImagePath: string | null;
  bio: string | null;
}
