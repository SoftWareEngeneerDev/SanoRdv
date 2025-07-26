import { Component, OnInit } from '@angular/core';
import { Notification, NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications: Notification[] = [];
  loading = true;
  medecinId: string | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.medecinId = localStorage.getItem('medecinId');

    if (this.medecinId) {
      this.fetchNotifications();
    } else {
      console.warn("Aucun ID médecin trouvé. L'utilisateur est-il bien connecté ?");
      this.loading = false;
    }
  }

  fetchNotifications(): void {
    if (!this.medecinId) return;

    this.notificationService.getNotificationsMedecin(this.medecinId).subscribe({
      next: (res: { notifications: Notification[] }) => {
        this.notifications = res.notifications.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt),
          rendezVous: notif.rendezVous
            ? {
                ...notif.rendezVous,
                date: new Date(notif.rendezVous.date)
              }
            : undefined
        }));
        console.log('Notifications récupérées :', this.notifications);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des notifications :', err);
        this.loading = false;
      }
    });
  }
}
