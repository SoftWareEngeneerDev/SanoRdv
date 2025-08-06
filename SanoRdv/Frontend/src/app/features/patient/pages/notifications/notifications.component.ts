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
  notifications: Notification[] = [];
  notificationsGroupes: { type: string, notifications: Notification[] }[] = [];
  unreadCount = 0;
  voirPlusMap: { [id: string]: boolean } = {};

  messageSuccess = '';
  messageError = '';

  // Récupérer les infos utilisateur depuis localStorage ou service auth
  userId = localStorage.getItem('userId') || '';
  userType = (localStorage.getItem('userType') || 'patient') as 'patient' | 'medecin';

  constructor(
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.userId && this.userType) {
      this.loadNotifications();
    } else {
      this.messageError = 'Utilisateur non identifié.';
    }
  }

  loadNotifications(): void {
    this.notificationsService.getNotifications(this.userType, this.userId).subscribe({
      next: (res) => {
        if (!res.success || !res.notifications) {
          this.messageError = 'Erreur lors de la récupération des notifications.';
          this.notifications = [];
          this.notificationsGroupes = [];
          return;
        }

        // Trier par date (du plus récent au plus ancien)
        this.notifications = res.notifications.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.grouperNotificationsParType();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des notifications :', err);
        this.messageError = 'Impossible de charger les notifications.';
      }
    });
  }

  grouperNotificationsParType(): void {
    const groupesMap: { [type: string]: Notification[] } = {};

    this.notifications.forEach(n => {
      const type = n.type?.toLowerCase() || 'autre';
      if (!groupesMap[type]) {
        groupesMap[type] = [];
      }
      groupesMap[type].push(n);
    });

    this.notificationsGroupes = Object.entries(groupesMap).map(([type, notifications]) => ({
      type,
      notifications
    }));
  }

  toggleVoirPlus(notif: Notification): void {
    if (!notif._id) return;

    const estOuvert = this.voirPlusMap[notif._id] ?? false;
    this.voirPlusMap[notif._id] = !estOuvert;

    // Si on ouvre une notif non lue, on la marque comme lue
    if (!estOuvert && !notif.read) {
      notif.read = true;
      this.unreadCount = this.notifications.filter(n => !n.read).length;

      this.notificationsService.markAsRead(notif._id).subscribe({
        next: () => {},
        error: () => {
          this.messageError = 'Erreur lors de la mise à jour de la notification.';
        }
      });
    }
  }

  getIconClass(type?: string): string {
    const t = type?.toLowerCase() || '';
    switch (t) {
      case 'rappel': return 'bi bi-calendar-event text-info';
      case 'annulation': return 'bi bi-x-circle-fill text-danger';
      case 'confirmation': return 'bi bi-check-circle-fill text-success';
      default: return 'bi bi-info-circle text-secondary';
    }
  }

  getTitre(type?: string): string {
    const t = type?.toLowerCase() || '';
    switch (t) {
      case 'rappel': return 'Rappels';
      case 'annulation': return 'Annulations';
      case 'confirmation': return 'Confirmations';
      default: return 'Autres notifications';
    }
  }

  getMessage(notif: Notification): string {
    const date = this.formatDate(notif.dateNotification || notif.createdAt || '');
    const type = notif.type?.toLowerCase() || '';
    switch (type) {
      case 'rappel':
        return notif.contenu || `Rappel : Rendez-vous prévu le ${date}.`;
      case 'annulation':
        return notif.contenu || `Votre rendez-vous a été annulé (${date}).`;
      case 'confirmation':
        return notif.contenu || `Votre rendez-vous est confirmé pour le ${date}.`;
      default:
        return notif.contenu || 'Nouvelle notification reçue.';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  retourDashboard(): void {
    this.router.navigate(['/dashboard', this.userType === 'patient' ? 'patients' : 'medecins']);
  }
}
