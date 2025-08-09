import { Component, OnInit } from '@angular/core';
import { NotificationsService } from 'src/app/shared/services/notifications.service';
import { Notification } from 'src/app/shared/models/notifications.model';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  notificationsGroupes: { type: string, notifications: Notification[] }[] = [];

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit(): void {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) {
      console.error("Aucun patient connecté.");
      return;
    }

    this.notificationsService.getNotificationsForPatient(patientId).subscribe({
      next: (res) => {
        const notifs = res.notifications || [];
        this.notifications = this.cleanOldNotifications(notifs).sort((a, b) => {
          const dateA = new Date(a.dateNotification ?? a.createdAt ?? '').getTime();
          const dateB = new Date(b.dateNotification ?? b.createdAt ?? '').getTime();
          return dateB - dateA;
        });
        this.notificationsGroupes = this.groupNotifications(this.notifications);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des notifications :', error);
      }
    });
  }

  /**
   * Regroupe les notifications par type.
   */
  private groupNotifications(notifications: Notification[]) {
    const groupes: { [key: string]: Notification[] } = {};
    notifications.forEach((notif) => {
      const type = notif.type || 'autre';
      if (!groupes[type]) groupes[type] = [];
      groupes[type].push(notif);
    });

    return Object.keys(groupes).map(type => ({
      type,
      notifications: groupes[type]
    }));
  }

  /**
   * Formatte la date d'une notification.
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '' : date.toLocaleString();
  }

  /**
   * Nettoie les notifications vieilles de plus de 30 jours.
   */
  private cleanOldNotifications(notifs: Notification[]): Notification[] {
    const now = new Date();
    return notifs.filter(n => {
      const date = new Date(n.dateNotification ?? n.createdAt ?? '');
      const diffJours = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
      return diffJours <= 30;
    });
  }

  /**
   * Retourne l'icône CSS en fonction du type.
   */
  getIconClass(type: string): string {
    switch (type) {
      case 'rappel': return 'bi bi-alarm';
      case 'annulation': return 'bi bi-x-circle';
      case 'confirmation': return 'bi bi-check-circle';
      default: return 'bi bi-bell';
    }
  }

  /**
   * Retourne le titre du groupe de notifications selon son type.
   */
  getTitre(type: string): string {
    switch (type) {
      case 'rappel': return 'Rappels de rendez-vous';
      case 'annulation': return 'Rendez-vous annulés';
      case 'confirmation': return 'Confirmations';
      default: return 'Autres notifications';
    }
  }

  /**
   * Retourne le message affiché pour une notification.
   */
  getMessage(notif: Notification): string {
  return notif.contenu || 'Notification sans message';
}

}
