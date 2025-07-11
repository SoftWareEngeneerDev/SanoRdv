import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css']
})
export class AdminHeaderComponent {
 
  @Input() isCollapsed: boolean = false;

    constructor(private router: Router) {}


  notification() {
    this.router.navigate(['/admin/notifications']);
  }


}
