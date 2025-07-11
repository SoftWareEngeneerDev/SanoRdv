import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MedecinService } from '../../medecin.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  defaultPhoto = 'https://via.placeholder.com/100';
  profile: any;

  constructor(private router: Router, private medecinService: MedecinService) {
    this.profile = { ...this.medecinService.getProfile() };
  }

  onSave() {
    this.medecinService.updateProfile(this.profile);
    this.router.navigate(['/medecin/profil-view']);
  }

  onCancel() {
    this.router.navigate(['/medecin/profil-view']);
  }

  onFileSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profile.photo = e.target.result; // base64 string
    };
    reader.readAsDataURL(file);
  }
 }

}
