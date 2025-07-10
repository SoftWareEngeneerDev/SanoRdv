import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { RechercheMedecinService } from '../patient/services/recherche-medecin.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnInit {
  @ViewChild('carouselContainer', { static: false }) carouselContainer!: ElementRef;

  query = '';
  medecins: any[] = [];

  constructor(private rechercheService: RechercheMedecinService) {}

  ngOnInit(): void {
    // S'abonner aux résultats de la recherche
    this.rechercheService.results$.subscribe(results => {
      console.log('Résultats bruts reçus:', results);

      // Exemple 1 : Si chaque résultat a un champ data qui contient les infos
      this.medecins = results.map((r: any) => ({
        id: r.data?._id || r.data?.id,
        nom: r.data?.nom || 'N/A',
        specialite: r.data?.specialite || 'N/A',
        localite: r.data?.localite || 'N/A'
      }));

      // Exemple 2 : Si les résultats ont directement les propriétés (décommenter si besoin)
      /*
      this.medecins = results.map((r: any) => ({
        id: r._id || r.id,
        nom: r.nom || 'N/A',
        specialite: r.specialite || 'N/A',
        localite: r.localite || 'N/A'
      }));
      */

      console.log('Médecins formatés:', this.medecins);
    });
  }

  ngAfterViewInit(): void {
    const container = this.carouselContainer.nativeElement as HTMLElement;
    const scrollAmount = 300;

    const nextBnt = document.getElementById('nextBtn');
    const prevBnt = document.getElementById('prevBtn');

    if (nextBnt && prevBnt) {
      nextBnt.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });

      prevBnt.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }
  }

  onSearch() {
    if (this.query.trim()) {
      this.rechercheService.search(this.query);
    } else {
      this.rechercheService.clearResults();
      this.medecins = [];
    }
  }
}
