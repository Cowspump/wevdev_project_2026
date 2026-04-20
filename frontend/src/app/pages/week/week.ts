import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Task {
  title: string;
  description: string;
  time: string;
}

interface DayColumn {
  name: string;
  shortName: string;
  date: string;
  tasks: Task[];
}

@Component({
  selector: 'app-week-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './week.html',
  styleUrl: './week.css'
})
export class WeekPageComponent {
  days: DayColumn[] = [];
  showModal = false;
  selectedDayIndex = -1;

  newTask: Task = { title: '', description: '', time: '' };

  private readonly dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  private readonly shortDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor() {
    this.buildWeek();
  }

  private buildWeek(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    this.days = this.dayNames.map((name, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + i);
      return {
        name,
        shortName: this.shortDayNames[i],
        date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        tasks: []
      };
    });
  }

  isToday(dayIndex: number): boolean {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return dayIndex === todayIndex;
  }

  openModal(dayIndex: number): void {
    this.selectedDayIndex = dayIndex;
    this.newTask = { title: '', description: '', time: '' };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDayIndex = -1;
  }

  addTask(): void {
    if (!this.newTask.title.trim()) return;

    this.days[this.selectedDayIndex].tasks.push({ ...this.newTask });
    this.closeModal();
  }

  removeTask(dayIndex: number, taskIndex: number): void {
    this.days[dayIndex].tasks.splice(taskIndex, 1);
  }
}
