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
  profile: any = {};

  constructor(private router: Router, private medecinServie: MedecinService) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const medecinId = user._id;

    if (medecinId) {
      this.medecinServie.getMedecinById(medecinId).subscribe({
        next: (data) => {
          this.profile = data;
        },
        error: (err) => {
          console.error('Erreur chargement profil médecin :', err);
        }
      });
    } else {
      console.warn("Médecin non connecté");
    }
  }

  onSave() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const medecinId = user._id;

  if (medecinId) {
    this.medecinServie.updateMedecin(medecinId, this.profile).subscribe({
      next: () => {
        alert("Profil mis à jour avec succès.");
        this.router.navigate(['/medecin/profil-view']);
      },
      error: (err) => {
        console.error("Erreur mise à jour profil :", err);
        alert("Erreur lors de la mise à jour.");
      }
    });
  }
}

  onCancel() {
    this.router.navigate(['/medecin/profil-view']);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profile.photo = e.target.result; // stocké en base64
      };
      reader.readAsDataURL(file);
    }
  }
}
