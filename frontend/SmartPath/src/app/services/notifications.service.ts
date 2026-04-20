import { Injectable, signal, computed } from '@angular/core';

export type NotificationPriority = 'critical' | 'warning' | 'info';
export type NotificationCategory = 'exam' | 'deadline' | 'reminder' | 'tip';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  time: string;
  dueIn: string;
  read: boolean;
  dismissed: boolean;
  icon: string;
  course?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private _notifications = signal<AppNotification[]>([
    {
      id: '1',
      title: 'Linear Algebra Exam',
      message: 'Your Linear Algebra midterm is in 2 days. You have covered 65% of the material.',
      priority: 'critical',
      category: 'exam',
      time: '09:00',
      dueIn: '2 days',
      read: false,
      dismissed: false,
      icon: '📝',
      course: 'MATH 201',
    },
    {
      id: '2',
      title: 'Research Paper Deadline',
      message: 'Section 2 of your research paper is due tomorrow at 11:59 PM.',
      priority: 'critical',
      category: 'deadline',
      time: '10:15',
      dueIn: '1 day',
      read: false,
      dismissed: false,
      icon: '📄',
      course: 'ENG 305',
    },
    {
      id: '3',
      title: 'Physics Lab Report',
      message: 'Start your physics lab report today — it typically takes 3–4 hours.',
      priority: 'warning',
      category: 'reminder',
      time: '11:30',
      dueIn: '3 days',
      read: false,
      dismissed: false,
      icon: '⚗️',
      course: 'PHY 101',
    },
    {
      id: '4',
      title: 'Study Break Recommended',
      message: 'You have been in deep focus for 90 minutes. A 15-minute break will boost retention.',
      priority: 'info',
      category: 'tip',
      time: '13:00',
      dueIn: 'Now',
      read: false,
      dismissed: false,
      icon: '🧘',
    },
    {
      id: '5',
      title: 'CS Assignment',
      message: 'Your data structures assignment is due in 4 days. 40% complete.',
      priority: 'warning',
      category: 'deadline',
      time: '14:00',
      dueIn: '4 days',
      read: true,
      dismissed: false,
      icon: '💻',
      course: 'CS 202',
    },
    {
      id: '6',
      title: 'Weekly Review',
      message: 'You completed 83% of tasks this week — your best streak yet!',
      priority: 'info',
      category: 'tip',
      time: '18:00',
      dueIn: 'Today',
      read: true,
      dismissed: false,
      icon: '📈',
    },
    {
      id: '7',
      title: 'Chemistry Quiz',
      message: 'Short quiz on organic compounds next Monday. 20 minutes of review recommended.',
      priority: 'warning',
      category: 'exam',
      time: '08:00',
      dueIn: '5 days',
      read: false,
      dismissed: false,
      icon: '🧪',
      course: 'CHEM 110',
    },
    {
      id: '8',
      title: 'Sleep Reminder',
      message: 'Consistent sleep improves exam performance by up to 30%. Aim for 7–8 hours tonight.',
      priority: 'info',
      category: 'tip',
      time: '22:00',
      dueIn: 'Tonight',
      read: true,
      dismissed: false,
      icon: '🌙',
    },
  ]);

  readonly notifications = computed(() =>
    this._notifications().filter(n => !n.dismissed)
  );

  readonly unreadCount = computed(() =>
    this._notifications().filter(n => !n.read && !n.dismissed).length
  );

  readonly criticalCount = computed(() =>
    this._notifications().filter(n => n.priority === 'critical' && !n.dismissed).length
  );

  markRead(id: string): void {
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllRead(): void {
    this._notifications.update(list =>
      list.map(n => ({ ...n, read: true }))
    );
  }

  dismiss(id: string): void {
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
  }

  addNotification(notif: Omit<AppNotification, 'id' | 'read' | 'dismissed'>): void {
    const newNotif: AppNotification = {
      ...notif,
      id: Date.now().toString(),
      read: false,
      dismissed: false,
    };
    this._notifications.update(list => [newNotif, ...list]);
  }
}
