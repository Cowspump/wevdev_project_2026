import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing/landing';
import { SchedulePage } from './pages/schedule/schedule';
import {NotificationsPage} from './pages/notifications/notifications';
import { LoginPage } from './pages/login/login';
import { guestGuard, authGuard} from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'schedule', component: SchedulePage, canActivate: [authGuard] },
  { path: 'notifications', component: NotificationsPage, canActivate: [authGuard] },
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: '**', redirectTo: '' },
];
