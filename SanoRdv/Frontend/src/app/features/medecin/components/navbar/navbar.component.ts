import { Component,Input  } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() isCollapsed: boolean = false;
  constructor(private router: Router) {}
    AccueilPage() {
    localStorage.clear();
    this.router.navigate(['/']);
  }
    AProposPage() {
    this.router.navigate(['/about']);
  }
}
