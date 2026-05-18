import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../../shared/components/footer/footer';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  agreedToTerms = signal(false);

  form = signal({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });

  togglePassword() {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit() {
    // wird später mit Keycloak verbunden
    console.log('Register:', this.form());
  }
}
