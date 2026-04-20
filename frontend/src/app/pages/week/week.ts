import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';

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
  newTask: Task = { title: '', description: '', time: '', deadline: '' };

  isToday(dayIndex: number): boolean {
    return dayIndex === this.ts.getTodayIndex();
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
    if (!this.newTask.title.trim()) return;
    this.ts.days[this.selectedDayIndex].tasks.push({ ...this.newTask });
    this.closeModal();
  }

  removeTask(dayIndex: number, taskIndex: number): void {
    this.ts.days[dayIndex].tasks.splice(taskIndex, 1);
  }
}
