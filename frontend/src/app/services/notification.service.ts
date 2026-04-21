import { Injectable, inject } from '@angular/core';
import { TaskService } from './task.service';

export interface AppNotification {
  id: string;
  taskTitle: string;
  message: string;
  urgency: 'today' | 'tomorrow';
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private ts = inject(TaskService);
  private _notifications: AppNotification[] = [];

  constructor() {
    this.refresh();
  }

  refresh(): void {
    const all = this.ts.getAllTasks();
    const existing = new Map(this._notifications.map(n => [n.id, n]));
    const next: AppNotification[] = [];

    for (const { task } of all) {
      const d = this.ts.daysUntilDeadline(task);
      if (d === null) continue;
      if (d !== 0 && d !== 1) continue;

      const urgency: 'today' | 'tomorrow' = d === 0 ? 'today' : 'tomorrow';
      const id = `${task.title}-${task.deadline}`;
      const message = d === 0
        ? `"${task.title}" is due today. Make sure to complete it!`
        : `"${task.title}" is due tomorrow. Don't forget!`;

      // Preserve read state if notification already existed
      const prev = existing.get(id);
      next.push({
        id,
        taskTitle: task.title,
        message,
        urgency,
        read: prev ? prev.read : false
      });
    }

    this._notifications = next;
  }

  get notifications(): AppNotification[] {
    this.refresh();
    return this._notifications;
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  get badgeLabel(): string {
    const count = this.unreadCount;
    if (count === 0) return '';
    return count > 9 ? '9+' : String(count);
  }

  markRead(id: string): void {
    const n = this._notifications.find(n => n.id === id);
    if (n) n.read = true;
  }

  markAllRead(): void {
    this._notifications.forEach(n => (n.read = true));
  }
}
