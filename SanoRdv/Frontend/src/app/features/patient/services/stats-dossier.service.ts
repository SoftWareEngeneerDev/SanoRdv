import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsDossierService {
  private ajouts = new BehaviorSubject<number>(0);
  ajouts$ = this.ajouts.asObservable();

  incrementAjout() {
    this.ajouts.next(this.ajouts.value + 1);
  }

  decrementAjout() {
    const current = this.ajouts.value;
    this.ajouts.next(current > 0 ? current - 1 : 0);
  }
}
