import { Component } from '@angular/core';

@Component({
  selector: 'app-week-page',
  standalone: true,
  templateUrl: './week.html',
  styleUrl: './week.css'
})
export class WeekPageComponent {
  protected readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  protected readonly hours = Array.from({ length: 24 }, (_, hour) =>
    hour.toString().padStart(2, '0')
  );
}