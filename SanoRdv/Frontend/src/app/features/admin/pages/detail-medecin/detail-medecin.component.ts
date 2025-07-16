import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedecinService } from '../../services/medecin.service';
import { Medecin } from '../../models/medecin.model';

@Component({
  selector: 'app-detail-medecin',
  templateUrl: './detail-medecin.component.html',
  styleUrls: ['./detail-medecin.component.css']
})
export class DetailMedecinComponent implements OnInit {
  medecin?: Medecin;

  constructor(
    private route: ActivatedRoute,
    private medecinService: MedecinService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.medecinService.getMedecinById(id).subscribe(data => {
        this.medecin = data;
      });
    }
  }

  retourListe(): void {
  this.router.navigate(['/admin/medecins']);
}

}
