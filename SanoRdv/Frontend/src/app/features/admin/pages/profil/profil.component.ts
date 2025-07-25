import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminService } from '../../admin.service';
import { Admin } from '../../models/admin.model';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {

  profileForm!: FormGroup;
  photoBase64: string | null = null;
  adminId!: string;

  // Variables pour afficher nom et prénom connecté
  nomConnecte: string = '';
  prenomConnecte: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Utilisateur non connecté');
      this.router.navigate(['/login']);
      return;
    }
    const userData = JSON.parse(storedUser);
    this.adminId = userData._id;

    // Stocker nom et prénom pour affichage
    this.nomConnecte = userData.nom || '';
    this.prenomConnecte = userData.prenom || '';

    this.profileForm = this.fb.group({
      email: [userData.email || '', [Validators.email]],
      photo: [null, Validators.required]
    });

    this.adminService.getAdminById(this.adminId).subscribe(
      (admin: Admin) => {
        this.photoBase64 = admin.photo || null;
        this.profileForm.patchValue({
          nom: admin.nom,
          prenom: admin.prenom,
          email: admin.email,
          photo: null
        });
      },
      err => console.error('Erreur chargement profil', err)
    );
  }

onFileSelected(event: any): void {
  const file: File = event.target.files[0];
  if (file) {
    const maxSizeInBytes = 2 * 1024 * 1024; // 2 Mo
    if (file.size > maxSizeInBytes) {
      alert('Le fichier est trop volumineux (max 2 Mo)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.photoBase64 = reader.result as string;
      this.profileForm.patchValue({ photo: file });
    };
    reader.readAsDataURL(file);
  }
}

  onSubmit(): void {
    if (this.profileForm.valid) {
      if (!this.photoBase64) {
        alert('La photo est obligatoire.');
        return;
      }

      const data: { email?: string; photo: string } = {
        photo: this.photoBase64
      };

      const emailValue = this.profileForm.get('email')?.value;
      if (emailValue) {
        data.email = emailValue;
      }

      this.adminService.updateAdmin(this.adminId, data).subscribe({
        next: res => {
          alert(res.message);
          this.router.navigate(['/admin/dashboard']);
        },
        error: err => {
          alert('Erreur lors de la mise à jour');
          console.error(err);
        }
      });
    } else {
      alert('Formulaire invalide. Veuillez vérifier les champs.');
    }
  }
}
