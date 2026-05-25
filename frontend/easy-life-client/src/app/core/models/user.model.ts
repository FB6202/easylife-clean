export interface AddressResponse {
  id: number;
  street: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip: string | null;
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
  theme: string;
  language: string;
  timezone: string;
  notifications: boolean;
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
