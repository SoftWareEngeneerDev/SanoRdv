import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Notification } from '../../shared/models/notifications.model';
import { environment } from 'src/environment/environments';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private apiUrl = `${environment.apiUrl}/notifications`;

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

  fetchNotifications(): Observable<Notification[]> {
    const patientId = localStorage.getItem('IDpatient');
    if (!patientId) {
      console.warn('Patient non connecté');
      return of([]);
    }
    return this.http.get<Notification[]>(`${this.apiUrl}/patient/${patientId}`, this.getHeaders()).pipe(
      tap(notifs => {
        this.notifications = this.cleanOldNotifications(notifs)
          .sort((a, b) => new Date(b.dateNotification).getTime() - new Date(a.dateNotification).getTime());
        this.updateUnreadCount();
      })
    );
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

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

  creerNotification(notification: Notification): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, notification, this.getHeaders()).pipe(
      tap((createdNotif) => {
        this.notifications.push(createdNotif);
        this.updateUnreadCount();
      })
    );
  }

  incrementUnreadCount(): void {
    this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
  }

  resetUnreadCount(): void {
    this.unreadCountSubject.next(0);
  }

  private cleanOldNotifications(notifs: Notification[]): Notification[] {
    const now = new Date();
    return notifs.filter(n => {
      const diffJours = (now.getTime() - new Date(n.dateNotification).getTime()) / (1000 * 3600 * 24);
      return diffJours <= 30;
    });
  }

  private updateUnreadCount() {
    const count = this.notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(count);
  }

  envoyerNotificationAnnulationPatient(rdvId: number): Observable<any> {
    // Suppression du segment /notification dans l'URL (car déjà présent dans this.apiUrl)
    return this.http.post(`${this.apiUrl}/patient/annulation`, { rdvId }, this.getHeaders());
  }

  envoyerNotificationAnnulationMedecin(rdvId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/medecin/annulation`, { rdvId }, this.getHeaders());
  }

  // Envoi de notification de confirmation de prise de rendez-vous au patient
envoyerNotificationPriseRdvPatient(data: { creneauId: string; timeSlotId?: string }): Observable<any> {
  return this.http.post(
    `${environment.apiUrl}/notifications/notification/patient/confirmation`,
    data,
    this.getHeaders()
  );
}
}
