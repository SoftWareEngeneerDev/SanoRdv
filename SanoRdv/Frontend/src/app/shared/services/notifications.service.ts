import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  fetchNotifications(): Observable<Notification[]> {
    const patientId = localStorage.getItem('IDpatient');
    if (!patientId) {
      console.warn('Patient non connecté');
      return of([]);
    }
    return this.http.get<Notification[]>(`${this.apiUrl}/patient/${patientId}`).pipe(
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
    return this.http.put(`${this.apiUrl}/${id}/mark-as-read`, {}).pipe(
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
    return this.http.post<Notification>(this.apiUrl, notification).pipe(
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
    return this.http.post(`${this.apiUrl}/notification/patient/annulation/${rdvId}`, {});
  }

  envoyerNotificationAnnulationMedecin(rdvId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/notification/medecin/annulation/${rdvId}`, {});
  }
}
