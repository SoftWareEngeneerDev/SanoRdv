import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  values = [
    { icon: 'bi-heart', title: 'Bien-être', description: 'Nous plaçons le bien-être des patients au cœur de nos préoccupations.' },
    { icon: 'bi-person-lines-fill', title: 'Communauté', description: 'Notre plateforme favorise l’inclusion et l’accessibilité des soins pour tous.' },
    { icon: 'bi-hand-thumbs-up', title: 'Engagement', description: 'Nous nous engageons à offrir un service fiable, sécurisé et de qualité.' }
  ];

  stats = [
    { number: '500+', label: 'Médecins enregistrés' },
    { number: '30000+', label: 'Rendez-vous pris' },
    { number: '100%', label: 'Satisfaction des utilisateurs' }
  ];

  engagements = [
    'Accès facilité aux soins médicaux',
    'Plateforme moderne et sécurisée',
    'Suivi personnalisé pour chaque patient'
  ];

  contactInfo = [
    { icon: 'bi-telephone', title: 'Téléphone', info: '+226 123 456 789', details: 'Disponible du lundi au vendredi de 9h à 17h' },
    { icon: 'bi-envelope', title: 'Email', info: 'support@sanordv.com', details: 'Contactez-nous pour toute demande ou question' },
    { icon: 'bi-geo-alt', title: 'Adresse', info: '123 Rue Exemple, Ouagadougou, Burkina Faso', details: 'Visitez-nous à notre bureau' }
  ];

  constructor() { }
}
