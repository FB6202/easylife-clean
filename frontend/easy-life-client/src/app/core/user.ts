import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  // Hardcoded für Dev – später aus Keycloak JWT
  readonly currentUserId = signal<number>(1);
  readonly currentUsername = signal<string>('felix');
  readonly currentPlan = signal<string>('Premium Plan');
}
