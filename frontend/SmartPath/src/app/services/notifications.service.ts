import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type NotificationPriority = 'critical' | 'warning' | 'info';
export type NotificationCategory = 'exam' | 'deadline' | 'reminder' | 'tip';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  course: string;
  read: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);
  private api = 'http://localhost:8000/api/notifications/';

  private _notifications = signal<AppNotification[]>([]);

  readonly notifications = computed(() => this._notifications());

  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.read).length
  );

  readonly criticalCount = computed(() =>
    this._notifications().filter(n => n.priority === 'critical').length
  );

  loadNotifications(): void {
    this.http.get<AppNotification[]>(this.api).subscribe({
      next: (data) => this._notifications.set(data),
      error: () => this._notifications.set([]),
    });
  }

  markRead(id: number): void {
    this.http.patch(`${this.api}${id}/`, { read: true }).subscribe(() => {
      this._notifications.update(list =>
        list.map(n => n.id === id ? { ...n, read: true } : n)
      );
    });
  }

  markAllRead(): void {
    this.http.post(`${this.api}mark_all_read/`, {}).subscribe(() => {
      this._notifications.update(list =>
        list.map(n => ({ ...n, read: true }))
      );
    });
  }

  dismiss(id: number): void {
    this.http.delete(`${this.api}${id}/`).subscribe(() => {
      this._notifications.update(list =>
        list.filter(n => n.id !== id)
      );
    });
  }

  addNotification(notif: Partial<AppNotification>): void {
    this.http.post<AppNotification>(this.api, notif).subscribe(created => {
      this._notifications.update(list => [created, ...list]);
    });
  }
}
