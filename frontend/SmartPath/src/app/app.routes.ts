import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing/landing';
import { SchedulePage } from './pages/schedule/schedule';
import {NotificationsPage} from './pages/notifications/notifications';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'schedule', component: SchedulePage },
  { path: 'notifications', component: NotificationsPage },
  { path: '**', redirectTo: '' },
];
