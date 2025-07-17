import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification } from '../../shared/models/notifications.model';
import { tap } from 'rxjs/operators';
import { environment} from 'src/environment/environments'

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  increment() {
    throw new Error('Method not implemented.');
  }
  private apiUrl = environment.apiUrl + '/notifications';

  private notifications: Notification[] = [];

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Récupère les notifications du patient connecté
  fetchNotifications(): Observable<Notification[]> {
    const patientId = localStorage.getItem('IDpatient');
    if (!patientId) {
      throw new Error('Patient non connecté');
    }
    return this.http.get<Notification[]>(`${this.apiUrl}/patient/${patientId}`).pipe(
      tap(notifs => {
        this.notifications = this.cleanOldNotifications(notifs);
        this.updateUnreadCount();
      })
    );
  }

  // Retourne les notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  // Marque une notification comme lue (PUT)
  markAsRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/mark-as-read`, {}).pipe(
      tap(() => {
        const notif = this.notifications.find(n => n.id === id || (n as any)._id === id);
        if (notif && !notif.read) {
          notif.read = true;
          this.updateUnreadCount();
        }
      })
    );
  }

  // Création d'une notification
 creerNotification(notification: Notification): Observable<Notification> {
  return this.http.post<Notification>(this.apiUrl, notification).pipe(
    tap((createdNotif) => {
      this.notifications.push(createdNotif);
      this.updateUnreadCount();
    })
  );
}

  // Nettoie les notifications plus anciennes que 30 jours
  private cleanOldNotifications(notifs: Notification[]): Notification[] {
    const now = new Date();
    return notifs.filter(n => {
      const diffJours = (now.getTime() - new Date(n.dateNotification).getTime()) / (1000 * 3600 * 24);
      return diffJours <= 30;
    });
  }

  // Met à jour le nombre de notifications non lues
  private updateUnreadCount() {
    const count = this.notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(count);
  }
}
