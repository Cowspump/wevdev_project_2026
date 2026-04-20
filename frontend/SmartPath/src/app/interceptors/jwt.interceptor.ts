import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, catchError, switchMap, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Tracks whether a token refresh is currently in flight so we don't
// fire multiple refresh requests when several calls 401 simultaneously.
let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);

  // Attach token if available
  const authedReq = addToken(req, auth.token());

  return next(authedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Only attempt refresh on 401 for non-auth endpoints
      if (err.status === 401 && !req.url.includes('/auth/')) {
        return handle401(req, next, auth);
      }
      return throwError(() => err);
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req;
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshDone$.next(null);

    return auth.refreshToken().pipe(
      switchMap(res => {
        isRefreshing = false;
        refreshDone$.next(res.token);
        return next(addToken(req, res.token));
      }),
      catchError(err => {
        isRefreshing = false;
        auth.logout();
        return throwError(() => err);
      })
    );
  }

  // Queue subsequent requests until refresh completes
  return refreshDone$.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap(token => next(addToken(req, token)))
  );
}
