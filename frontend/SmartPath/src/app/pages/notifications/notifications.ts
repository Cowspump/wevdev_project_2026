import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationsService, AppNotification, NotificationPriority, NotificationCategory } from '../../services/notifications.service';

type FilterTab = 'all' | 'unread' | 'critical' | 'exam' | 'deadline' | 'tip';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsPage implements OnInit {
  private svc = inject(NotificationsService);

  activeFilter = signal<FilterTab>('all');
  showAddForm = signal(false);

  // Form fields
  newTitle = signal('');
  newMessage = signal('');
  newCategory = signal<NotificationCategory>('reminder');
  newPriority = signal<NotificationPriority>('info');
  newCourse = signal('');

  readonly allNotifications = this.svc.notifications;
  readonly unreadCount = this.svc.unreadCount;
  readonly criticalCount = this.svc.criticalCount;

  ngOnInit() {
    this.svc.loadNotifications();
  }

  readonly filtered = computed(() => {
    const f = this.activeFilter();
    const list = this.allNotifications();
    switch (f) {
      case 'unread':   return list.filter(n => !n.read);
      case 'critical': return list.filter(n => n.priority === 'critical');
      case 'exam':     return list.filter(n => n.category === 'exam');
      case 'deadline': return list.filter(n => n.category === 'deadline');
      case 'tip':      return list.filter(n => n.category === 'tip');
      default:         return list;
    }
  });

  setFilter(f: FilterTab): void {
    this.activeFilter.set(f);
  }

  markRead(id: number): void {
    this.svc.markRead(id);
  }

  markAllRead(): void {
    this.svc.markAllRead();
  }

  dismiss(id: number, event: Event): void {
    event.stopPropagation();
    this.svc.dismiss(id);
  }

  priorityLabel(p: NotificationPriority): string {
    return { critical: 'Critical', warning: 'Soon', info: 'Info' }[p];
  }

  categoryIcon(c: NotificationCategory): string {
    return { exam: '📝', deadline: '⏰', reminder: '🔔', tip: '💡' }[c];
  }

  submitNew(): void {
    if (!this.newTitle() || !this.newMessage()) return;
    this.svc.addNotification({
      title: this.newTitle(),
      message: this.newMessage(),
      priority: this.newPriority(),
      category: this.newCategory(),
      course: this.newCourse() || '',
    });
    this.newTitle.set('');
    this.newMessage.set('');
    this.newCourse.set('');
    this.showAddForm.set(false);
  }
}
