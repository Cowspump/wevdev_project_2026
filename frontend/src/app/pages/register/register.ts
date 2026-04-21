import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  register(): void {
    if (!this.email.trim() || !this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'All fields are required';
      return;
    }

    this.isLoading = true;
    this.authService.register(this.email, this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.email?.[0] || err.error?.username?.[0] || 'Registration failed';
        this.isLoading = false;
      }
    });
  }
}
