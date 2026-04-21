import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  access: string;
  refresh: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000/api/auth';
  isAuthenticated = signal(false);
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuth();
  }

  register(email: string, username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, { email, username, password });
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, { email: username, password }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        this.isAuthenticated.set(true);
        this.fetchCurrentUser();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  private checkAuth(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.isAuthenticated.set(true);
      this.fetchCurrentUser();
    }
  }

  private fetchCurrentUser(): void {
    this.http.get<User>(`${this.apiUrl}/me/`).subscribe({
      next: (user) => this.currentUser.set(user),
      error: () => this.logout()
    });
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
