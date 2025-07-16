import { Component} from '@angular/core';
import { MedecinService } from '../../Medecin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profil-view',
  templateUrl: './profil-view.component.html',
  styleUrls: ['./profil-view.component.css']
})
export class ProfilViewComponent {

  profile: any;

  constructor(private medecinService: MedecinService, private router: Router) {
    this.profile = this.medecinService.getProfile();
  }

  editProfile(){
    this.router.navigate(['/medecin/profile']);
  }

  calculateAge(dateNaissance: string): number {
    const birthDate = new Date(dateNaissance);
    const ageDiff = Date.now() - birthDate.getTime();
    return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
  }
}
