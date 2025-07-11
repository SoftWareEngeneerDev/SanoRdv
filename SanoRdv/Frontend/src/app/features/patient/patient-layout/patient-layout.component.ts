import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-layout',
  templateUrl: './patient-layout.component.html',
  styleUrls: ['./patient-layout.component.css']
})
export class PatientLayoutComponent {
  isCollapsed = false;

  // Réception de l’état depuis le sidebar
  onSidebarCollapse(value: boolean) {
    this.isCollapsed = value;
  }
}
