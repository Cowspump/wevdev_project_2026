import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ScheduleTask {
  title: string;
  note: string;
  color: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  protected readonly hours = Array.from(
    { length: 24 },
    (_, index) => `${String(index).padStart(2, '0')}:00`
  );

  private readonly schedule: Record<string, ScheduleTask> = {};

  protected getTask(day: string, hour: string): ScheduleTask | undefined {
    return this.schedule[`${day}-${hour}`];
  }
}
