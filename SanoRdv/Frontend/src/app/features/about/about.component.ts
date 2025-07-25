import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; // Import HttpClient pour les appels API

interface StatItem {
  number: string;
  label: string;
  icon?: string;
  color?: string;
}

interface ValueItem {
  icon: string;
  title: string;
  description: string;
  color?: string;
}

interface ContactItem {
  icon: string;
  title: string;
  info: string;
  details: string;
  link?: string;
}

interface EngagementItem {
  text: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  submissionSuccess = false;
  submissionError = false;
  statsLoading = true; // Nouveau: Indicateur de chargement pour les stats
  statsError = false; // Nouveau: Indicateur d'erreur pour les stats

  // Données structurées avec types
  values: ValueItem[] = [
    { 
      icon: 'bi-heart-fill', 
      title: 'Bien-être', 
      description: 'Nous plaçons le bien-être des patients au cœur de nos préoccupations et veillons à leur offrir les meilleurs soins possibles.',
      color: '#e74c3c'
    },
    { 
      icon: 'bi-people-fill', 
      title: 'Communauté', 
      description: 'Notre plateforme favorise l\'inclusion et l\'accessibilité des soins pour tous, sans discrimination.',
      color: '#3498db'
    },
    { 
      icon: 'bi-shield-check', 
      title: 'Engagement', 
      description: 'Nous nous engageons à offrir un service fiable, sécurisé et de qualité supérieure à tous nos utilisateurs.',
      color: '#2ecc71'
    }
  ];

  // Stats initialisées avec des valeurs par défaut (seront mises à jour via API)
  stats: StatItem[] = [
    { 
      number: '0', // Valeur temporaire remplacée par l'API
      label: 'Médecins enregistrés',
      icon: 'bi-person-badge',
      color: '#00a3e0'
    },
    { 
      number: '0', // Valeur temporaire remplacée par l'API
      label: 'Rendez-vous pris',
      icon: 'bi-calendar-check',
      color: '#2ecc71'
    },
    { 
      number: '100%', 
      label: 'Satisfaction des utilisateurs',
      icon: 'bi-star-fill',
      color: '#f39c12'
    }
  ];

  engagements: EngagementItem[] = [
    { text: 'Accès facilité aux soins médicaux 24h/24', icon: 'bi-clock' },
    { text: 'Plateforme moderne et sécurisée avec chiffrement SSL', icon: 'bi-shield-lock' },
    { text: 'Suivi personnalisé pour chaque patient', icon: 'bi-person-heart' },
    { text: 'Support client réactif et professionnel', icon: 'bi-headset' },
    { text: 'Téléconsultation avec des spécialistes', icon: 'bi-camera-video' }
  ];

  contactInfo: ContactItem[] = [
    { 
      icon: 'bi-telephone-fill', 
      title: 'Téléphone', 
      info: '+226 60 00 02 63', 
      details: 'Disponible du lundi au vendredi de 9h à 17h',
      link: 'tel:+22660000263'
    },
    { 
      icon: 'bi-envelope-fill', 
      title: 'Email', 
      info: 'support@sanordv.com', 
      details: 'Réponse sous 24h maximum',
      link: 'mailto:support@sanordv.com'
    },
    { 
      icon: 'bi-geo-alt-fill', 
      title: 'Adresse', 
      info: '123 Rue Exemple, Ouagadougou, Burkina Faso', 
      details: 'Visitez-nous à notre bureau principal'
    }
  ];

  // Données pour la section mission
  missionCards = [
    {
      icon: 'bi-heart-pulse',
      title: '500+ Médecins',
      description: 'Professionnels qualifiés et expérimentés à votre service dans toutes les spécialités médicales'
    },
    {
      icon: 'bi-calendar-plus',
      title: 'Rendez-vous simplifiés',
      description: 'Prise de rendez-vous en quelques clics avec confirmation instantanée'
    },
    {
      icon: 'bi-geo-alt',
      title: 'Couverture nationale',
      description: 'Service accessible partout au Burkina Faso avec réseau de partenaires étendus'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient // Injection de HttpClient pour les appels API
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?226\d{8}$/)]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadStats(); // Remplace animateStats() par le chargement des stats depuis l'API
  }

  /**
   * Charge les statistiques depuis l'API backend
   */
  loadStats(): void {
    this.statsLoading = true;
    this.statsError = false;

    this.http.get<any>('http://localhost:3000/api/state/dashboard').subscribe({
      next: (data) => {
        // Mise à jour des valeurs avec les données de l'API
        this.stats[0].number = `${data.medecinsActifs}`; // Médecins actifs
        this.stats[1].number = `${data.totalRendezVous}`; // Rendez-vous confirmés
        
        // Optionnel: Animation des chiffres
        this.animateNumbers();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
        this.statsError = true;
        
        // Valeurs de fallback
        this.stats[0].number = '500+';
        this.stats[1].number = '30,000+';
      },
      complete: () => {
        this.statsLoading = false;
      }
    });
  }

  /**
   * Animation des chiffres (optionnel)
   */
  private animateNumbers(): void {
    // Implémente ici une animation si nécessaire
    // Ex: Compteur qui monte progressivement
  }

  // ... (le reste des méthodes existantes reste inchangé)
  // [Gestion du formulaire, méthodes utilitaires, etc.]
  // --------------------------------------------------
  // Gestion du formulaire de contact
  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submissionSuccess = false;
      this.submissionError = false;

      // Simulation d'envoi (remplacez par votre service)
      setTimeout(() => {
        this.isSubmitting = false;
        this.submissionSuccess = true;
        this.contactForm.reset();
        
        // Masquer le message de succès après 5 secondes
        setTimeout(() => {
          this.submissionSuccess = false;
        }, 5000);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  // Marquer tous les champs comme touchés pour afficher les erreurs
  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Vérifier si un champ a une erreur
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.contactForm.get(fieldName);
    if (!field) return false;
    
    if (errorType) {
      return field.hasError(errorType) && field.touched;
    }
    return field.invalid && field.touched;
  }

  // Obtenir le message d'erreur pour un champ
  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;
    
    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} est requis`;
    }
    if (errors['email']) {
      return 'Format d\'email invalide';
    }
    if (errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} doit contenir au moins ${errors['minlength'].requiredLength} caractères`;
    }
    if (errors['pattern']) {
      return 'Format de téléphone invalide (ex: +226 12345678)';
    }
    
    return 'Champ invalide';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'name': 'Le nom',
      'email': 'L\'email',
      'phone': 'Le téléphone',
      'subject': 'Le sujet',
      'message': 'Le message'
    };
    return labels[fieldName] || fieldName;
  }

  // Méthode pour gérer les clics sur les liens de contact
  handleContactClick(contact: ContactItem): void {
    if (contact.link) {
      window.open(contact.link, '_blank');
    }
  }

  // Méthode pour scroller vers une section
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}