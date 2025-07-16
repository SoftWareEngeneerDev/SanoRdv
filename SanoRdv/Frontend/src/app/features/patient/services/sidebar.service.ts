// sidebar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // Comportement initial : sidebar non pliée (false)
  private collapsedSubject = new BehaviorSubject<boolean>(false);

  // Observable que les composants peuvent souscrire
  collapsed$ = this.collapsedSubject.asObservable();
  sidebarCollapsed$: any;

  // Méthode pour basculer l'état
  toggle() {
    this.collapsedSubject.next(!this.collapsedSubject.value);
  }

  // Méthode pour définir explicitement l'état (optionnel)
  setCollapsed(value: boolean) {
    this.collapsedSubject.next(value);
  }
}
