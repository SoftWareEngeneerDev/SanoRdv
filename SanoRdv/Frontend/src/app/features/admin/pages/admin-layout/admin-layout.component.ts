import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {

     isCollapsed = false;

  // Réception de l’état depuis le sidebar
  onSidebarCollapse(value: boolean) {
    this.isCollapsed = value;
  }

}
