import { Component, OnInit } from '@angular/core';
import { Notification } from '../../../../shared/models/notifications.model';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [
    {
      id: '1',
      message: 'Votre rendez-vous avec Dr. Dupont le 27 juin 2025 a été confirmé.',
      dateNotification: new Date().toISOString(),
      type: 'confirmation',
      medecin: 'Dr. Dupont',
      read: false
    },
    {
      id: '2',
      message: 'Rappel : Rendez-vous avec Dr. Martin demain à 10h.',
      dateNotification: new Date(Date.now() - 86400000).toISOString(),
      type: 'rappel',
      medecin: 'Dr. Martin',
      read: false
    },
    {
      id: '2',
      message: 'Rappel : Rendez-vous avec Dr. Martin demain à 10h.',
      dateNotification: new Date(Date.now() - 86400000).toISOString(),
      type: 'rappel',
      medecin: 'Dr. Martin',
      read: false
    },
    {
      id: '3',
      message: 'Votre rendez-vous avec Dr. Leroy le 29 juin 2025 a été annulé.',
      dateNotification: new Date(Date.now() - 2 * 86400000).toISOString(),
      type: 'annulation',
      medecin: 'Dr. Leroy',
      read: true
    }
  ];

  unreadCount = this.notifications.filter(n => !n.read).length;
  voirPlusMap: { [id: string]: boolean } = {};

  messageSuccess = '';
  messageError = '';

  //  Ajout pour les groupes
  notificationsGroupes: { type: string, notifications: Notification[] }[] = [];

  constructor(
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.grouperNotificationsParType(); // 🔄 regrouper au chargement (test local)
    // this.loadNotifications(); // Décommente si backend actif
  }

  retourDashboard() {
    this.router.navigate(['/dashboard/patients']);
  }

  loadNotifications() {
    this.notificationsService.fetchNotifications().subscribe(() => {
      const allNotifs = this.notificationsService.getNotifications();
      this.notifications = allNotifs.sort(
        (a, b) => new Date(b.dateNotification).getTime() - new Date(a.dateNotification).getTime()
      );
      this.unreadCount = this.notifications.filter(n => !n.read).length;

      // 🔄 Recalcul des groupes après réception backend
      this.grouperNotificationsParType();
    });
  }

  //  Regroupement des notifications par type
  grouperNotificationsParType(): void {
    const groupesMap: { [type: string]: Notification[] } = {};

    this.notifications.forEach(n => {
       if (n.type) {
      if (!groupesMap[n.type]) {
        groupesMap[n.type] = [];
      }
      groupesMap[n.type].push(n);
    }
    });

    this.notificationsGroupes = Object.entries(groupesMap).map(([type, notifications]) => ({
      type,
      notifications
    }));
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'rappel': return 'bi bi-calendar-event text-info';
      case 'confirmation': return 'bi bi-check-circle-fill text-success';
      case 'annulation': return 'bi bi-x-circle-fill text-danger';
      default: return 'bi bi-info-circle text-secondary';
    }
  }

  getTitre(type: string): string {
    switch (type) {
      case 'rappel': return 'Rappel';
      case 'confirmation': return 'Confirmation';
      case 'annulation': return 'Annulation';
      default: return 'Notification';
    }
  }

  getMessage(notif: Notification): string {
    const date = this.formatDate(notif.dateNotification);
    switch (notif.type) {
      case 'rappel':
        return notif.message || `Rappel : Rendez-vous avec le ${notif.medecin} le ${date}.`;
      case 'confirmation':
        return notif.message || `Votre rendez-vous avec le ${notif.medecin} le ${date} a été confirmé.`;
      case 'annulation':
        return notif.message || `Votre rendez-vous avec le ${notif.medecin} le ${date} a été annulé.`;
      default:
        return notif.message || 'Vous avez une nouvelle notification.';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleVoirPlus(notif: Notification) {
    if (!notif.id) return;
    const estOuvert = this.voirPlusMap[notif.id] ?? false;
    if (!estOuvert && !notif.read) {
      notif.read = true;
      this.unreadCount = this.notifications.filter(n => !n.read).length;

      // Appel backend actif
      this.notificationsService.markAsRead(notif.id).subscribe(() => {
        notif.read = true;
        this.loadNotifications(); // recharge pour MAJ visuelle
      });
    }
    this.voirPlusMap[notif.id] = !estOuvert;
  }
}
