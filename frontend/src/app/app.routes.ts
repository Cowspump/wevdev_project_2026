import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home';
import { WeekPageComponent } from './pages/week/week';

export const routes: Routes = [
	{
		path: '',
		component: HomePageComponent,
		pathMatch: 'full'
	},
	{
		path: 'week',
		component: WeekPageComponent
	}
];
