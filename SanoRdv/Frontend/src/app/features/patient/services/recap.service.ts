import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecapService {
  private motifKey = 'recap_motif';
  private medecinKey = 'recap_medecin';
  private patientKey = 'recap_patient';
  private creneauKey = 'recap_creneau';

  constructor() {}

  // Setters
  setMotif(motif: string): void {
    localStorage.setItem(this.motifKey, motif);
  }

  setMedecin(medecin: any): void {
    localStorage.setItem(this.medecinKey, JSON.stringify(medecin));
  }

  setPatient(patient: any): void {
    localStorage.setItem(this.patientKey, JSON.stringify(patient));
  }

 setCreneau(creneau: { patientId: string; dateSelectionne: Date; slot: any ; timeSlots: any []; idcreneau: string}): void {
  localStorage.setItem(this.creneauKey, JSON.stringify(creneau));
}

  setRdv(medecin: any, creneau: { _id: string; date: string; heure: string }): void {
  this.setMedecin(medecin);
  // this.setCreneau(creneau);
}


// recap.service.ts (extrait)
private dateHeureISO: string | null = null;

setDateHeureISO(dateHeureISO: string) {
  this.dateHeureISO = dateHeureISO;
}

getDateHeureISO(): string | null {
  return this.dateHeureISO;
}


  // Getters
  getMotif(): string {
    return localStorage.getItem(this.motifKey) || '';
  }

  getMedecin(): any {
    const medecinStr = localStorage.getItem(this.medecinKey);
    return medecinStr ? JSON.parse(medecinStr) : null;
  }

  getPatient(): any {
    const patientStr = localStorage.getItem(this.patientKey);
    return patientStr ? JSON.parse(patientStr) : null;
  }
getCreneau(): any {
  const creneauStr = localStorage.getItem(this.creneauKey);
  return creneauStr ? JSON.parse(creneauStr) : null;
}


  getDate(): string | null {
  const creneau = this.getCreneau();
  return creneau ? creneau.dateSelectionne : null;
}

 getHeure(): string | null {
  const creneau = this.getCreneau();
  return creneau?.slot?.time || null;
}


  clearData(): void {
    localStorage.removeItem(this.motifKey);
    localStorage.removeItem(this.medecinKey);
    localStorage.removeItem(this.patientKey);
    localStorage.removeItem(this.creneauKey);
  }
}
