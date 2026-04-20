import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScheduleService, ScheduleEntry } from '../../services/schedule.service';

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
export class SchedulePage implements OnInit {
  private scheduleService = inject(ScheduleService);

  protected readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  protected readonly hours = Array.from(
    { length: 24 },
    (_, index) => `${String(index).padStart(2, '0')}:00`,
  );

  private schedule: Record<string, ScheduleTask> = {};

  ngOnInit() {
    this.scheduleService.getSchedule().subscribe({
      next: (entries) => {
        this.schedule = {};
        for (const entry of entries) {
          const day = this.days[entry.day_of_week];
          for (let h = entry.start_hour; h < entry.end_hour; h++) {
            const hour = `${String(h).padStart(2, '0')}:00`;
            this.schedule[`${day}-${hour}`] = {
              title: entry.title,
              note: '',
              color: entry.color,
            };
          }
        }
      },
      error: () => {},
    });
  }

  protected getTask(day: string, hour: string): ScheduleTask | undefined {
    return this.schedule[`${day}-${hour}`];
  }
}
