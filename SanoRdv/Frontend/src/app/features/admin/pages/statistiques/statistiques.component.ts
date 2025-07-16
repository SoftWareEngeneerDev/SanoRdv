import { Component } from '@angular/core';
import { StatistiqueService, StatsHebdo } from '../../services/statistique.service';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.css']
})
export class StatistiquesComponent {

   periode = 'hebdo';
  donnees: StatsHebdo[] = [];

   constructor(private StatistiqueService: StatistiqueService) {}

    genererRapport(): void {
    this.StatistiqueService.getRapportHebdomadaire().subscribe((data) => {
      this.donnees = data;
    });
  }

   exporterPDF(): void {
    const doc = new jsPDF();
    doc.text('Rapport Hebdomadaire des Rendez-vous Confirmés', 10, 10);

    autoTable(doc, {
      head: [['Date', 'Nombre de RDV Confirmés']],
      body: this.donnees.map((item) => [item.date, item.count.toString()]),
      startY: 20
    });

    doc.save('rapport-hebdomadaire.pdf');
  }

}
