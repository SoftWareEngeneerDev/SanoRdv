import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpecialiteService } from '../../services/specialite.service';
import { Specialite } from '../../models/specialites.model';

@Component({
  selector: 'app-modifier-specialites',
  templateUrl: './modifier-specialites.component.html',
  styleUrls: ['./modifier-specialites.component.css']
})
export class ModifierSpecialitesComponent implements OnInit {

     specialite: Specialite = {
    _id: '',
    nom: '',
    description: '',
    nombreMedecins: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private specialiteService: SpecialiteService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chargerSpecialite(id);
      console.log('Modifier spécialité avec id :', id);
    }
  }

  chargerSpecialite(id: string): void {
    this.specialiteService.getSpecialiteById(id).subscribe({
      next: (specialite) => this.specialite = specialite,
      error: () => this.router.navigate(['/admin/specialites'])
    });
  }

  mettreAJour(): void {
  if (this.specialite && this.specialite._id) {
    this.specialiteService
      .modifierSpecialite(this.specialite._id, this.specialite)
      .subscribe({
        next: () => this.router.navigate(['/admin/specialites']),
        error: (err) => console.error('Erreur lors de la mise à jour', err)
      });
  } else {
    console.error('ID de la spécialité manquant pour la mise à jour');
  }
}


  annuler(): void {
    this.router.navigate(['/admin/specialites']);
  }

}
