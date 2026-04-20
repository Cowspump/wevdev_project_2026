import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-pomodoro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pomodoro.html',
  styleUrl: './pomodoro.css',
})
export class PomodoroPage implements OnInit, OnDestroy {
  private taskService = inject(TaskService);

  tasks = signal<Task[]>([]);
  selectedTaskId = signal<number | null>(null);

  // timer
  minutes = signal(25);
  seconds = signal(0);
  isRunning = signal(false);
  isBreak = signal(false);
  sessionsCompleted = signal(0);

  private timerId: any = null;

  // settings
  workMinutes = 25;
  breakMinutes = 5;

  ngOnInit() {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        // only show tasks that are not done
        this.tasks.set(data.filter(t => t.status !== 'done'));
      }
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    if (this.isRunning()) return;
    this.isRunning.set(true);

    this.timerId = setInterval(() => {
      if (this.seconds() > 0) {
        this.seconds.update(s => s - 1);
      } else if (this.minutes() > 0) {
        this.minutes.update(m => m - 1);
        this.seconds.set(59);
      } else {
        // timer done
        this.stopTimer();
        this.onTimerDone();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning.set(false);
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  resetTimer() {
    this.stopTimer();
    if (this.isBreak()) {
      this.minutes.set(this.breakMinutes);
    } else {
      this.minutes.set(this.workMinutes);
    }
    this.seconds.set(0);
  }

  private stopTimer() {
    this.isRunning.set(false);
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private onTimerDone() {
    // play a simple beep sound
    try {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==';
      audio.play().catch(() => {});
    } catch (e) {}

    if (!this.isBreak()) {
      // work session done
      this.sessionsCompleted.update(s => s + 1);
      this.isBreak.set(true);
      this.minutes.set(this.breakMinutes);
      this.seconds.set(0);
    } else {
      // break done, back to work
      this.isBreak.set(false);
      this.minutes.set(this.workMinutes);
      this.seconds.set(0);
    }
  }

  applySettings() {
    this.stopTimer();
    this.isBreak.set(false);
    this.minutes.set(this.workMinutes);
    this.seconds.set(0);
  }

  getSelectedTask(): Task | null {
    const id = this.selectedTaskId();
    if (!id) return null;
    return this.tasks().find(t => t.id === id) || null;
  }

  formatTime(): string {
    const m = String(this.minutes()).padStart(2, '0');
    const s = String(this.seconds()).padStart(2, '0');
    return `${m}:${s}`;
  }

  getProgress(): number {
    const total = (this.isBreak() ? this.breakMinutes : this.workMinutes) * 60;
    const current = this.minutes() * 60 + this.seconds();
    return ((total - current) / total) * 100;
  }
}
