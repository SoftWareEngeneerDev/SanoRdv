import { Component, OnInit } from '@angular/core';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {

      patients: Patient[] = [];
  patientASupprimer: string | null = null;
  searchTerm: string = '';
  router: any;

  constructor(private patientService: PatientService, route: Router) {}

  ngOnInit(): void {
     this.listePatients();
  }

  listePatients() {
    this.patientService.getPatients().subscribe(data => {
      this.patients = data;
    });
  }

  ouvrirConfirmation(id: string) {
  this.patientASupprimer = id;
}

annulerSuppression() {
  this.patientASupprimer = null;
}

confirmerSuppression() {
  if (this.patientASupprimer) {
    this.patientService.supprimerPatient(this.patientASupprimer).subscribe(() => {
      this.listePatients();  // Recharge la liste
      this.patientASupprimer = null;  // Ferme la modale
    });
  }
}

  activerDesactiver(p: Patient) {
    const action = p.actif ? 'désactiver' : 'activer';
    if (confirm(`Voulez-vous ${action} ce patient ?`)) {
      this.patientService.toggleEtat(p.id).subscribe(() => {
        this.listePatients();
      });
    }
  }

 filteredPatients(): Patient[] {
  if (!this.searchTerm) return this.patients;
  const term = this.searchTerm.toLowerCase();
  return this.patients.filter(p =>
    p.nom.toLowerCase().includes(term) || p.email.toLowerCase().includes(term)
  );
}


  voirHistorique(id: string) {
    // 🚧 Rediriger vers la page de l’historique
     this.router.navigate(['/admin/patients', id, 'historique']);
    console.log("Historique du patient :", id);
  }


}
