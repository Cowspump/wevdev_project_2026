import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
<<<<<<< HEAD
import { TaskService, Task } from '../../services/task.service';
=======

interface Task {
  title: string;
  description: string;
  time: string;
  deadline: string;
}

interface DayColumn {
  name: string;
  shortName: string;
  date: string;
  tasks: Task[];
}
>>>>>>> 4584a84 (might have conflict)

@Component({
  selector: 'app-week-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './week.html',
  styleUrl: './week.css'
})
export class WeekPageComponent {
  protected ts = inject(TaskService);

  showModal = false;
  selectedDayIndex = -1;
<<<<<<< HEAD
  newTask: Task = { title: '', description: '', time: '', deadline: '' };
=======

  newTask: Task = { title: '', description: '', time: '', deadline: '' };

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
>>>>>>> 4584a84 (might have conflict)

  isToday(dayIndex: number): boolean {
    return dayIndex === this.ts.getTodayIndex();
  }

  deadlineColor(task: Task): 'green' | 'yellow' | 'red' {
    if (!task.deadline) {
      return 'green';
    }

    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return 'red';
    }

    if (diffDays <= 3) {
      return 'yellow';
    }

    return 'green';
  }

  deadlineLabel(task: Task): string {
    if (!task.deadline) {
      return '';
    }

    const color = this.deadlineColor(task);

    if (color === 'red') {
      return 'Urgent';
    }

    if (color === 'yellow') {
      return 'Soon';
    }

    return 'Planned';
  }

  openModal(dayIndex: number): void {
    this.selectedDayIndex = dayIndex;
    this.newTask = { title: '', description: '', time: '', deadline: '' };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDayIndex = -1;
  }

  addTask(): void {
<<<<<<< HEAD
    if (!this.newTask.title.trim()) return;
    this.ts.days[this.selectedDayIndex].tasks.push({ ...this.newTask });
=======
    if (!this.newTask.title.trim()) {
      return;
    }

    this.days[this.selectedDayIndex].tasks.push({ ...this.newTask });
>>>>>>> 4584a84 (might have conflict)
    this.closeModal();
  }

  removeTask(dayIndex: number, taskIndex: number): void {
    this.ts.days[dayIndex].tasks.splice(taskIndex, 1);
  }
}
