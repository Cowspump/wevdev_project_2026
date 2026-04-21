import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home';
import { WeekPageComponent } from './pages/week/week';

import {NotificationsPageComponent} from './pages/notifications/notifications';

import { LoginComponent } from './pages/login/login';

export const routes: Routes = [
	{
		path: '',
		redirectTo: '/login',
		pathMatch: 'full'
	},
	{
		path: 'login',
		component: LoginComponent,
		pathMatch: 'full'
	},
	{
		path: 'home',
		component: HomePageComponent,
		pathMatch: 'full'
	},
	{
		path: 'week',
		component: WeekPageComponent
	},
  {
    path: 'notifications',
    component: NotificationsPageComponent
  }
];
