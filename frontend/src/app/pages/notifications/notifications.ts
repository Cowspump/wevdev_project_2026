import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class NotificationsPageComponent {
  protected ns = inject(NotificationService);

  get notifications() {
    return this.ns.notifications;
  }

  markRead(id: string): void {
    this.ns.markRead(id);
  }

  markAllRead(): void {
    this.ns.markAllRead();
  }
}
