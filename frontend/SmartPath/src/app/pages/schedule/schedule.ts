import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ScheduleTask {
  title: string;
  note: string;
  color: string;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})

export class SchedulePage {
  protected readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  protected readonly hours = Array.from(
    { length: 24 },
    (_, index) => `${String(index).padStart(2, '0')}:00`,
  );

  private readonly schedule: Record<string, ScheduleTask> = {};

  protected getTask(day: string, hour: string): ScheduleTask | undefined {
    return this.schedule[`${day}-${hour}`];
  }
}
