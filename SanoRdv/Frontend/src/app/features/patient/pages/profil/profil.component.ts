import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
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
  registerForm!: FormGroup;

  private API_BASE_URL = 'http://localhost:3000';
  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;
  errorMessages = '';
  successMessage = '';
  isSidebarCollapsed: boolean = false; // ou récupéré via service


  medecinId: string | null = null;
  medecinData: any = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private notificationsService: NotificationsService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserData();

    this.medecinId = this.route.snapshot.paramMap.get('medecinId');

    if (this.medecinId) {
      this.loadMedecinData(this.medecinId);
    }
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group(
      {
        nom: ['', [Validators.required, Validators.minLength(2)]],
        prenom: ['', [Validators.required, Validators.minLength(2)]],
        telephone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
        sexe: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        motDePasse: [''],
        nouveauMotDePasse: [''],
        confirmationMotDePasse: [''],
        localite: ['', Validators.required],
        adresse: ['', Validators.required],
        dateNaissance: ['', Validators.required],
        groupeSanguin: [''],
        allergies: [''],
      },
      { validators: this.passwordsMatch }
    );
  }

  private loadUserData(): void {
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const patient: Patient = JSON.parse(localUser);
        this.patchFormWithPatient(patient);
        return;
      } catch (err) {
        console.error('Erreur parsing localStorage:', err);
      }
    }

    this.patientService.getMonProfil().subscribe({
      next: (patient: Patient) => {
        this.patchFormWithPatient(patient);
      },
      error: () => {
        this.errorMessages = '';
      },
    });
  }

  private patchFormWithPatient(patient: Patient): void {
    const rawDate = patient.dateNaissance
      ? new Date(patient.dateNaissance)
      : null;
    const formattedDate = rawDate
      ? `${String(rawDate.getDate()).padStart(2, '0')}-${String(
          rawDate.getMonth() + 1
        ).padStart(2, '0')}-${rawDate.getFullYear()}`
      : '';

    this.registerForm.patchValue({
      nom: patient.nom || '',
      prenom: patient.prenom || '',
      email: patient.email || '',
      telephone: patient.telephone || '',
      sexe: patient.sex || '',
      localite: patient.localite || '',
      adresse: patient.adresse || '',
      motDePasse: '',
      dateNaissance: formattedDate,
      groupeSanguin: patient.groupeSanguin || '',
      allergies: patient.allergies || '',
    });

    this.previewUrl = patient.photo || 'assets/images/default-avatar.png';
  }

  passwordsMatch(form: AbstractControl) {
    const pass = form.get('nouveauMotDePasse')?.value;
    const confirm = form.get('confirmationMotDePasse')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required'])
        return `Le champ ${this.getFieldDisplayName(fieldName)} est requis`;
      if (field.errors['minlength'])
        return `Le champ ${this.getFieldDisplayName(
          fieldName
        )} doit contenir au moins ${
          field.errors['minlength'].requiredLength
        } caractères`;
      if (field.errors['email']) return "Format d'email invalide";
      if (field.errors['pattern'] && fieldName === 'telephone')
        return 'Numéro invalide (8 chiffres requis)';
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      nom: 'Nom',
      prenom: 'Prénom',
      telephone: 'Téléphone',
      sexe: 'Sexe',
      email: 'Email',
      motDePasse: 'Mot de passe',
      nouveauMotDePasse: 'Nouveau mot de passe',
      confirmationMotDePasse: 'Confirmation du mot de passe',
      localite: 'Localité',
      adresse: 'Adresse',
      dateNaissance: 'Date de naissance',
      groupeSanguin: 'Groupe sanguin',
      allergies: 'Allergies',
    };
    return displayNames[fieldName] || fieldName;
  }

  get passwordMismatchError(): boolean {
    return (
      this.registerForm.errors?.['passwordMismatch'] &&
      this.registerForm.get('confirmationMotDePasse')?.touched
    );
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

  onCancel(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler les modifications ?')) {
      this.registerForm.reset();
      this.loadUserData();
      this.router.navigate(['/patient/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessages = '';
    this.successMessage = '';

    const formData = new FormData();
    const value = this.registerForm.value;

    if (value.nouveauMotDePasse && !value.motDePasse) {
      this.errorMessages =
        'Veuillez saisir votre mot de passe actuel pour le modifier.';
      this.isSubmitting = false;
      return;
    }

    for (const key in value) {
      if (
        value.hasOwnProperty(key) &&
        value[key] !== null &&
        key !== 'confirmationMotDePasse'
      ) {
        formData.append(key, value[key].toString());
      }
    }

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    this.patientService.updateProfile(formData).subscribe({
      next: () => {
        this.successMessage = 'Profil mis à jour avec succès !';

        // Mise à jour du localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          ...value,
          photo: this.previewUrl,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Notification
        this.notificationsService
          .creerNotification({
            message:
              'Vos informations personnelles ont été modifiées avec succès.',
            dateNotification: new Date().toISOString(),
            read: false,
          })
          .subscribe();

        this.router.navigate(['/patient/dashboard']);
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
      }
    });
  }
}
