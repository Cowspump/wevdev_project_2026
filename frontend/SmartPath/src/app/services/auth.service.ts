import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, tap, catchError, switchMap } from 'rxjs';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface ApiError {
  message: string;
  status: number;
  field?: string;
}

const TOKEN_KEY   = 'smartpath_jwt';
const REFRESH_KEY = 'smartpath_refresh';
const USER_KEY    = 'smartpath_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private readonly api = 'http://localhost:8000/api';

  // ── Reactive state ─────────────────────────────────────────────────
  private _token    = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _user     = signal<AuthUser | null>(this.loadUser());
  private _loading  = signal(false);
  private _error    = signal<ApiError | null>(null);

  readonly token      = this._token.asReadonly();
  readonly user       = this._user.asReadonly();
  readonly loading    = this._loading.asReadonly();
  readonly error      = this._error.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  // ── Register ─────────────────────────────────────────────────────────
  register(data: RegisterData): Observable<any> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post(`${this.api}/auth/register/`, data)
      .pipe(
        tap(() => this._loading.set(false)),
        catchError((err: HttpErrorResponse) => {
          this._loading.set(false);
          const apiError = this.parseError(err);
          this._error.set(apiError);
          return throwError(() => apiError);
        })
      );
  }

  // ── Login ───────────────────────────────────────────────────────────
  login(credentials: LoginCredentials): Observable<any> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<AuthResponse>(`${this.api}/auth/login/`, credentials)
      .pipe(
        tap(res => {
          localStorage.setItem(TOKEN_KEY, res.access);
          localStorage.setItem(REFRESH_KEY, res.refresh);
          this._token.set(res.access);
          this._loading.set(false);
        }),
        switchMap(() => this.fetchUser()),
        catchError((err: HttpErrorResponse) => {
          this._loading.set(false);
          const apiError = this.parseError(err);
          this._error.set(apiError);
          return throwError(() => apiError);
        })
      );
  }

  // ── Get current user info ───────────────────────────────────────────
  fetchUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.api}/auth/me/`).pipe(
      tap(user => {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        this._user.set(user);
      })
    );
  }

  // ── Logout ──────────────────────────────────────────────────────────
  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  // ── Clear error ─────────────────────────────────────────────────────
  clearError(): void {
    this._error.set(null);
  }

  // ── Refresh token (call when interceptor gets 401) ──────────────────
  refreshToken(): Observable<AuthResponse> {
    const refresh = localStorage.getItem(REFRESH_KEY);
    return this.http
      .post<AuthResponse>(`${this.api}/auth/refresh/`, { refresh })
      .pipe(
        tap(res => {
          localStorage.setItem(TOKEN_KEY, res.access);
          this._token.set(res.access);
        }),
        catchError((err: HttpErrorResponse) => {
          this.clearSession();
          this.router.navigate(['/login']);
          return throwError(() => this.parseError(err));
        })
      );
  }

  // ── Helpers ─────────────────────────────────────────────────────────
  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    this._error.set(null);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  parseError(err: HttpErrorResponse): ApiError {
    if (err.status === 0) {
      return { message: 'Cannot reach the server. Check your connection.', status: 0 };
    }
    if (err.status === 401) {
      return { message: 'Invalid email or password.', status: 401 };
    }
    if (err.status === 403) {
      return { message: 'You do not have permission to do that.', status: 403 };
    }
    if (err.status === 422 && err.error?.errors) {
      const first = Object.entries(err.error.errors)[0] as [string, string[]];
      return { message: first[1][0], status: 422, field: first[0] };
    }
    if (err.status >= 500) {
      return { message: 'Server error. Please try again later.', status: err.status };
    }
    return {
      message: err.error?.message ?? err.message ?? 'An unexpected error occurred.',
      status: err.status,
    };
  }
}
