import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home';
import { WeekPageComponent } from './pages/week/week';
import { NotificationsPageComponent } from './pages/notifications/notifications';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		redirectTo: '/login',
		pathMatch: 'full'
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'register',
		component: RegisterComponent
	},
	{
		path: 'home',
		component: HomePageComponent,
		canActivate: [authGuard]
	},
	{
		path: 'week',
		component: WeekPageComponent,
		canActivate: [authGuard]
	},
	{
		path: 'notifications',
		component: NotificationsPageComponent,
		canActivate: [authGuard]
	}
];
