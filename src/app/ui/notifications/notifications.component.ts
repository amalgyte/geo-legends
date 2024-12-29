import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface Notification {
  message: string;
  timestamp: number;
  delivered: boolean;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  ngOnInit(): void {
    // Mock notifications
    this.notifications = [
      { message: 'You researched Agriculture.', timestamp: Date.now() - 60000, delivered: true },
      { message: 'Your scout discovered a new area.', timestamp: Date.now() - 120000, delivered: true },
      { message: 'You were attacked! Defend your base.', timestamp: Date.now(), delivered: false },
    ];

    // Simulate message delivery based on the age
    this.deliverMessages();
  }

  private deliverMessages(): void {
    setTimeout(() => {
      this.notifications.forEach((notification) => {
        if (!notification.delivered) {
          notification.delivered = true;
        }
      });
    }, 5000); // Simulated delivery delay (e.g., 5 seconds for pigeon)
  }
}
