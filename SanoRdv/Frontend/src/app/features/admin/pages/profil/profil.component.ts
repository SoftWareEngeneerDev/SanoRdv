import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // ✅ pour la redirection
import { Admin } from '../../models/admin.model';
import { AdminService } from '../../admin.service';
// import { AdminService } from '../../services/admin.service'; // à utiliser si tu veux envoyer vers un backend

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent {

  profileForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router // ✅ injecte le Router
    // private adminService: AdminService // si tu utilises un service
  ) {
    this.profileForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      photo: [null]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.profileForm.patchValue({ photo: file });
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const formData = new FormData();
      formData.append('nom', this.profileForm.get('nom')?.value);
      formData.append('prenom', this.profileForm.get('prenom')?.value);
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile);
      }

      // 🔁 Appel au backend (à implémenter si besoin)
      console.log('Formulaire prêt à être envoyé :', formData);

      // ✅ Redirection vers dashboard après enregistrement
      this.router.navigate(['/admin/dashboard']);
    }
  }
}
