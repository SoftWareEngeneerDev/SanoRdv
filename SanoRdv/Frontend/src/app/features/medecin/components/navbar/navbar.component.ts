import { Component,Input  } from '@angular/core';
import { Router } from '@angular/router';


declare var bootstrap: any;

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

    deconnecter() {
      const modalElement = document.getElementById('modalConfirmationSuppression');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
      setTimeout(() => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('paddind-right');
        this.router.navigate(['/']);
        localStorage.clear();
      }, 100);
    }

}
