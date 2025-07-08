import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecapService {
  motif: string = '';
  medecin: any = null; // { nom, prenom, specialite, clinique, localisation, etc. }
  creneau: { date: string; heure: string } | null = null;

  constructor() {}

  // Setters
  setMotif(motif: string) {
    this.motif = motif;
  }

  setMedecin(medecin: any) {
    this.medecin = medecin;
  }

  setCreneau(creneau: { date: string; heure: string }) {
    this.creneau = creneau;
  }

  // Méthode unique pour setter medecin, date et heure en même temps
  setRdv(medecin: any, date: string, heure: string) {
    this.medecin = medecin;
    this.creneau = { date, heure };
  }

  // Getters
  getMotif(): string {
    return this.motif;
  }

  getMedecin(): any {
    return this.medecin;
  }

  getCreneau(): { date: string; heure: string } | null {
    return this.creneau;
  }

  // Récupérer uniquement la date du créneau
  getDate(): string | null {
    return this.creneau ? this.creneau.date : null;
  }

  // Récupérer uniquement l'heure du créneau
  getHeure(): string | null {
    return this.creneau ? this.creneau.heure : null;
  }

  // Reset (si besoin de vider les données)
  clearData() {
    this.motif = '';
    this.medecin = null;
    this.creneau = null;
  }
}
