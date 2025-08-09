import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Notification } from '../../shared/models/notifications.model';
import { environment } from 'src/environment/environments';

interface NotificationResponse {
  success: boolean;
  count: number;
  notifications: Notification[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private apiUrl = 'http://localhost:3000/api';

  private notifications: Notification[] = [];
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
    };
  }

  /**
   * Récupère les notifications du patient actuellement connecté
   */
  // fetchNotifications(): Observable<NotificationResponse> {
  //   const patientId = localStorage.getItem('patientId');
  //   if (!patientId) {
  //     console.warn('Patient non connecté');
  //     return of({ success: false, count: 0, notifications: [] });
  //   }

  //   return this.http
  //     .get<NotificationResponse>(`${this.apiUrl}/patient/${patientId}`, this.getHeaders())
  //     .pipe(
  //       tap((response) => {
  //         const notifs = response.notifications || [];
  //         if (!Array.isArray(notifs)) {
  //           console.warn('Réponse inattendue : notifications n\'est pas un tableau', notifs);
  //           return;
  //         }

  //         // Nettoyage et tri
  //         this.notifications = this.cleanOldNotifications(notifs).sort((a, b) => {
  //           const dateA = new Date(a.dateNotification ?? a.createdAt ?? 0).getTime();
  //           const dateB = new Date(b.dateNotification ?? b.createdAt ?? 0).getTime();
  //           return dateB - dateA;
  //         });

  //         this.updateUnreadCount();
  //       })
  //     );
  // }

  /**
   * Récupère les notifications d’un utilisateur (ex: patient ou médecin)
   */
  getNotificationsForPatient(patientId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/notification/patient/${patientId}`);
}

  getNotificationsForMedecin(medecinId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/notification/patient/${medecinId}`);
}
 
  /**
   * Marque une notification comme lue
   */
  markAsRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/mark-as-read`, {}, this.getHeaders()).pipe(
      tap(() => {
        const notif = this.notifications.find(n => (n as any)._id === id);
        if (notif && !notif.read) {
          notif.read = true;
          this.updateUnreadCount();
        }
      })
    );
  }

  /**
   * Crée une nouvelle notification
   */
  creerNotification(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification, this.getHeaders()).pipe(
      tap((createdNotif) => {
        this.notifications.push(createdNotif);
        this.updateUnreadCount();
      })
    );
  }

  /**
   * Nettoie les notifications vieilles de plus de 30 jours
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
   * Met à jour le compteur de notifications non lues
   */
  private updateUnreadCount(): void {
    const count = this.notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(count);
  }

  /**
   * Incrémente manuellement le compteur (ex: en temps réel)
   */
  incrementUnreadCount(): void {
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }

  /**
   * Réinitialise le compteur
   */
  resetUnreadCount(): void {
    this.unreadCountSubject.next(0);
  }

  /**
   * Envoie une notification d’annulation patient
   */
  envoyerNotificationAnnulationPatient(rdvId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/patient/annulation`, { rdvId }, this.getHeaders());
  }

  /**
   * Envoie une notification d’annulation médecin
   */
  envoyerNotificationAnnulationMedecin(rdvId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/medecin/annulation`, { rdvId }, this.getHeaders());
  }

  /**
   * Envoie une notification de confirmation de prise de rendez-vous (patient)
   */
  envoyerNotificationPriseRdvPatient(data: { creneauId: string; timeSlotId?: string }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/notification/patient/confirmation`,
      data,
      this.getHeaders()
    );
  }
}
