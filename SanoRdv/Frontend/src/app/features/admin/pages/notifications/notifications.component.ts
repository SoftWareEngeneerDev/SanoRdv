import { Component, OnInit } from '@angular/core';
import { Notification } from '../../models/notification.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

     notifications: Notification[] = [];
  filtreType: string = ''; // 'patient', 'medecin' ou ''

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.chargerNotifications();
  }

  chargerNotifications() {
    this.notificationService.getNotifications().subscribe(data => {
      this.notifications = data;
    });
  }

  notificationsFiltrees(): Notification[] {
    if (!this.filtreType) return this.notifications;
    return this.notifications.filter(n => n.destinataireType === this.filtreType);
  }

  supprimer(id: string) {
    this.notificationService.supprimerNotification(id).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== id);
    });
  }

}
