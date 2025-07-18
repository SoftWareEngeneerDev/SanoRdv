import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../../../shared/services/patient.service';
import { NotificationsService } from '../../../../shared/services/notifications.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Patient } from '../../../../shared/models/patient.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css'],
})
export class ProfilComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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

  private API_BASE_URL = 'http://localhost:3000';
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;
  errorMessages = '';
  successMessage = '';
  isSidebarCollapsed = false;

  medecinId: string | null = null;
  medecinData: any = null;

  // **Ajout de patientId pour utiliser dans updateProfile**
  patientId: string | null = null;

  constructor(
    private patientService: PatientService,
    private notificationsService: NotificationsService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Récupérer patientId depuis localStorage ou token (à adapter selon ta gestion d'auth)
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const patient: Patient = JSON.parse(localUser);
        this.patientId = patient._id || null; // Assure-toi que l'ID est stocké ici
      } catch {
        this.patientId = null;
      }
    }

    this.loadUserData();

    this.medecinId = this.route.snapshot.paramMap.get('medecinId');
    if (this.medecinId) {
      this.loadMedecinData(this.medecinId);
    }
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

    this.previewUrl = this.profile.photo || 'assets/images/default-avatar.png';
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
      return;
    }

    this.isSubmitting = true;
    this.errorMessages = '';
    this.successMessage = '';

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

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          ...this.profile,
          photo: this.previewUrl,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));


        this.router.navigate(['/patient/modifier']);
      },
      error: () => {
        this.errorMessages = 'Erreur lors de la mise à jour';
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  loadMedecinData(id: string): void {
    this.http.get<any>(`${this.API_BASE_URL}/api/medecins/${id}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.medecinData = response.data;
          console.log('Données du médecin chargées:', this.medecinData);
        } else {
          this.errorMessages = response.message || 'Médecin non trouvé.';
        }
      },
      error: (err) => {
        this.errorMessages = 'Erreur lors du chargement des données du médecin.';
        console.error(err);
      },
    });
  }
}
