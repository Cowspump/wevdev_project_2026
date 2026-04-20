import { Component, inject, OnDestroy } from '@angular/core';
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

  private timerId: ReturnType<typeof setInterval> | null = null;
  private readonly workDuration = 50 * 60;
  private readonly breakDuration = 10 * 60;

  timerMode: 'work' | 'break' = 'work';
  timerSecondsLeft = this.workDuration;
  timerRunning = false;

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

  startTimer(): void {
    if (this.timerRunning) return;
    this.timerRunning = true;
    this.timerId = setInterval(() => this.tickTimer(), 1000);
  }

  pauseTimer(): void {
    this.timerRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  resetTimer(): void {
    this.pauseTimer();
    this.timerMode = 'work';
    this.timerSecondsLeft = this.workDuration;
  }

  private tickTimer(): void {
    if (this.timerSecondsLeft > 0) {
      this.timerSecondsLeft--;
      return;
    }

    this.timerMode = this.timerMode === 'work' ? 'break' : 'work';
    this.timerSecondsLeft = this.timerMode === 'work' ? this.workDuration : this.breakDuration;
  }

  getTimerLabel(): string {
    const minutes = Math.floor(this.timerSecondsLeft / 60);
    const seconds = this.timerSecondsLeft % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  getTimerTitle(): string {
    return this.timerMode === 'work' ? 'Work' : 'Break';
  }

  ngOnDestroy(): void {
    this.pauseTimer();
  }
}
