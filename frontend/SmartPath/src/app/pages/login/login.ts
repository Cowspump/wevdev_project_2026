import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl:    './login.css',
})
export class LoginPage implements OnInit {
  auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  email      = signal('');
  password   = signal('');
  showPass   = signal(false);
  submitted  = signal(false);

  // Expose service signals directly to the template
  readonly loading = this.auth.loading;
  readonly error   = this.auth.error;

  private returnUrl = '/';

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/';
    // Clear any stale error from previous session
    this.auth.clearError();
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (!this.email() || !this.password()) return;

    this.auth.login({ email: this.email(), password: this.password() })
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl),
        error: () => { /* error already set in AuthService signal */ },
      });
  }

  fillDemo(role: 'student' | 'admin'): void {
    this.auth.clearError();
    if (role === 'student') {
      this.email.set('alex@university.edu');
      this.password.set('student123');
    } else {
      this.email.set('admin@smartpath.app');
      this.password.set('admin123');
    }
  }
}
