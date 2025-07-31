import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../../../shared/services/patient.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Patient } from '../../../../shared/models/patient.model';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css'],
})
export class ProfilComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Chemin vers l'avatar par défaut
  defaultAvatar = 'assets/images/default-avatar.png';

  profile: any = {
    nom: '',
    prenom: '',
    telephone: '',
    sex: '',
    email: '',
    localite: '',
    dateNaissance: '',
    groupeSanguin: '',
    allergies: '',
    photo: null,
  };

  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;

  successMessage: string = '';
  errorMessages: string = '';
  showAlert: boolean = false;
  isSidebarCollapsed = false;

  patientId: string | null = null;

  constructor(
    private patientService: PatientService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const patient: Patient = JSON.parse(localUser);
        this.patientId = patient._id || null;
      } catch {
        this.patientId = null;
      }
    }

    this.loadUserData();
  }

  loadUserData(): void {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const patient: Patient = JSON.parse(localUser);
        this.fillProfile(patient);
        return;
      } catch (err) {
        console.error('Erreur parsing localStorage:', err);
      }
    }

    this.patientService.getMonProfil().subscribe({
      next: (patient: Patient) => {
        this.fillProfile(patient);
      },
      error: () => {
        this.errorMessages = 'Erreur lors du chargement du profil';
        this.showTemporaryAlert();
      },
    });
  }

  fillProfile(patient: Patient): void {
    const rawDate = patient.dateNaissance ? new Date(patient.dateNaissance) : null;
    const formattedDate = rawDate
      ? `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}-${String(
          rawDate.getDate()
        ).padStart(2, '0')}`
      : '';

    this.profile = {
      nom: patient.nom || '',
      prenom: patient.prenom || '',
      email: patient.email || '',
      telephone: patient.telephone || '',
      sex: patient.sex || '',
      localite: patient.localite || '',
      dateNaissance: formattedDate,
      groupeSanguin: patient.groupeSanguin || '',
      allergies: patient.allergies || '',
      photo: patient.photo || null,
    };

    // Ajout d’un timestamp pour casser le cache navigateur
    this.previewUrl = this.profile.photo
      ? `${this.profile.photo}?t=${new Date().getTime()}`
      : this.defaultAvatar;
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!this.isValidImageFile(file)) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La taille du fichier ne doit pas dépasser 5MB');
      return;
    }

    this.selectedFile = file;
    this.profile.photo = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    this.selectedFile = null;
    this.profile.photo = null;
    this.previewUrl = this.defaultAvatar;
  }

  private isValidImageFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return allowedTypes.includes(file.type);
  }

  onCancel(form?: NgForm): void {
    if (confirm('Êtes-vous sûr de vouloir annuler les modifications ?')) {
      if (form) form.resetForm(this.profile);
      this.loadUserData();
      this.router.navigate(['/patient/modifier']);
    }
  }

  onSubmit(form: NgForm): void {
    if (!form.valid) {
      form.control.markAllAsTouched();
      return;
    }

    if (!this.patientId) {
      this.errorMessages = "Impossible d'identifier l'utilisateur connecté.";
      this.showTemporaryAlert();
      return;
    }

    this.isSubmitting = true;
    this.errorMessages = '';
    this.successMessage = '';
    this.showAlert = false;

    const formData = new FormData();

    for (const key in this.profile) {
      if (this.profile.hasOwnProperty(key) && this.profile[key] !== null) {
        if (key !== 'photo') {
          formData.append(key, this.profile[key].toString());
        }
      }
    }

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    this.patientService.updateProfile(this.patientId, formData).subscribe({
      next: () => {
        this.successMessage = 'Profil mis à jour avec succès !';
        this.errorMessages = '';
        this.showAlert = true;

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          ...this.profile,
          photo: this.previewUrl,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Actualisation de la photo
        this.patientService.getMonProfil().subscribe({
          next: (patient) => this.fillProfile(patient),
        });

        setTimeout(() => {
          this.showAlert = false;
          this.router.navigate(['/patient/modifier']);
        }, 3000);
      },
      error: () => {
        this.successMessage = '';
        this.errorMessages = 'Erreur lors de la mise à jour';
        this.showTemporaryAlert();
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  showTemporaryAlert(): void {
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 3000);
  }
}
