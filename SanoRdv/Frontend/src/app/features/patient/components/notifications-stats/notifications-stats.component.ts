import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-stats',
  templateUrl: './notifications-stats.component.html',
  styleUrls: ['./notifications-stats.component.css']
})
export class NotificationStatsComponent implements OnInit, OnDestroy {
  unreadCount: number = 0;
  private subscription!: Subscription;

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.subscription = this.notificationsService.unreadCount$.subscribe((count: number) => {
      this.unreadCount = count;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
