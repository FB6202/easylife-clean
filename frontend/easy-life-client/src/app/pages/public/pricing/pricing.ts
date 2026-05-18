import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { FooterComponent } from '../../../shared/components/footer/footer';

interface PricingPlan {
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  highlighted: boolean;
  badge?: string;
  features: { text: string; included: boolean }[];
  cta: string;
}

@Component({
  selector: 'app-pricing',
  imports: [RouterLink, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class PricingComponent {
  yearly = signal(false);

  readonly plans: PricingPlan[] = [
    {
      name: 'Free',
      price: 0,
      yearlyPrice: 0,
      description: 'Perfect for getting started and exploring Easy Life.',
      highlighted: false,
      features: [
        { text: 'Up to 50 Tasks', included: true },
        { text: 'Up to 10 Categories', included: true },
        { text: 'Up to 5 Goals', included: true },
        { text: 'Journal & Week Planning', included: true },
        { text: '500 MB Storage', included: true },
        { text: 'AI Agent', included: false },
        { text: 'Network & Following', included: false },
        { text: 'Priority Support', included: false },
      ],
      cta: 'Get Started Free',
    },
    {
      name: 'Plus',
      price: 7.99,
      yearlyPrice: 5.58,
      description: 'For people serious about organizing their life.',
      highlighted: true,
      badge: 'Most Popular',
      features: [
        { text: 'Unlimited Tasks', included: true },
        { text: 'Unlimited Categories', included: true },
        { text: 'Unlimited Goals', included: true },
        { text: 'Journal & Week Planning', included: true },
        { text: '10 GB Storage', included: true },
        { text: 'AI Agent (Basic)', included: true },
        { text: 'Network & Following', included: true },
        { text: 'Priority Support', included: false },
      ],
      cta: 'Start with Plus',
    },
    {
      name: 'Pro',
      price: 14.99,
      yearlyPrice: 10.49,
      description: 'For power users who want the full Easy Life experience.',
      highlighted: false,
      features: [
        { text: 'Unlimited Tasks', included: true },
        { text: 'Unlimited Categories', included: true },
        { text: 'Unlimited Goals', included: true },
        { text: 'Journal & Week Planning', included: true },
        { text: '50 GB Storage', included: true },
        { text: 'AI Agent (Full)', included: true },
        { text: 'Network & Following', included: true },
        { text: 'Priority Support', included: true },
      ],
      cta: 'Start with Pro',
    },
  ];

  getPrice(plan: PricingPlan): number {
    return this.yearly() ? plan.yearlyPrice : plan.price;
  }
}
