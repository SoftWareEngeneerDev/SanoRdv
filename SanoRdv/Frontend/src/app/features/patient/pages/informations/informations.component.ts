import { RecapService } from './../../services/recap.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Navigation } from '@angular/router';
import { MedecinService } from '../../../../shared/services/medecin.service';

@Component({
  selector: 'app-profil-medecin',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.css']
})
export class ProfilMedecinComponent implements OnInit {
  medecin: any = {
    nom: '',
    prenom: '',
    photo: '',
    specialite: '',
    age: 0,
    anneeExperience: 0,
    nationalite: '',
    telephone: '',
    email: '',
    localite: '',
    adresse: '',
    parcours: ''
  };
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private medecinService: MedecinService,
    private recapService: RecapService,
    private router: Router
  ) {}

 ngOnInit(): void {
  const navigation: Navigation | null = this.router.getCurrentNavigation();
  const medecinFromState = navigation?.extras?.state?.['medecin'] || null;

  if (medecinFromState) {
    this.medecin = {
      ...medecinFromState,
      age: this.calculerAge(medecinFromState.dateNaissance)
    };
    this.loading = false;
    console.log('Médecin reçu via navigation.state:', this.medecin);
  } else {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.medecinService.getMedecinById(id).subscribe({
        next: (data) => {
          this.medecin = {
            ...data,
            age: this.calculerAge(data.dateNaissance)
          };
          this.loading = false;
          console.log('Médecin récupéré depuis API:', this.medecin);
        },
        error: (error) => {
          console.error('Erreur lors de la récupération du médecin par ID:', error);
          this.errorMessage = 'Médecin introuvable ou erreur serveur.';
          this.loading = false;
        }
      });
    } else {
      this.errorMessage = 'Aucun médecin sélectionné.';
      this.loading = false;
    }
  }
}

  retour(): void {
    this.router.navigate(['/patient/dashboard']);
  }

prendreRDV(): void {
  const patientDataString = localStorage.getItem('user');
  let patientId: string | null = null;

  if (patientDataString) {
    try {
      const patientData = JSON.parse(patientDataString);
      patientId = patientData._id || null;
    } catch {
      console.warn('Impossible de récupérer patient depuis localStorage');
    }
  }

  if (this.medecin && this.medecin._id && patientId) {
    this.recapService.setMedecin(this.medecin);
    this.recapService.setPatient({ _id: patientId });

    this.router.navigate(['/patient/motif', this.medecin._id, patientId]);
  } else {
    console.warn('Médecin ou patient ID manquant');
  }
}


  calculerAge(dateNaissance: string): number {
    if (!dateNaissance) return 0;
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
