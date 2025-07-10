import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',                 // Le sélecteur du composant (balise HTML)
  templateUrl: './login.component.html', // Le fichier HTML associé
  styleUrls: ['./login.component.css']   // Le fichier CSS associé
})
export class LoginComponent {
  loginForm: FormGroup;                  // Formulaire de connexion
  password: string = '';                 // Variable pour stocker le mot de passe
  showPassword: boolean = false;         // Contrôle l'affichage du mot de passe

  constructor(
    private fb: FormBuilder,             // FormBuilder pour créer le formulaire
    private authService: AuthService,    // Service d'authentification
    private router: Router               // Pour la navigation
  ) {
    // Initialisation du formulaire avec validations
    this.loginForm = this.fb.group({
      UserID: ['', [Validators.required]],      // Champ UserID requis
      motDePasse: ['', Validators.required]     // Champ motDePasse requis
    });
  }

  //  Méthode appelée à la soumission du formulaire
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          const role = response?.user?.role;
          // Rediriger selon le rôle
          if (role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'medecin') {
            this.router.navigate(['/medecin']);
          } else if (role === 'patient') {
            this.router.navigate(['/patient']);
          } else {
            this.router.navigate(['/Accueil']);
          }
        },
        error: (err) => {
          console.error('Erreur de connexion :', err);
          // 👉 Tu peux afficher un message d'erreur à l'utilisateur ici
        }
      });
    }
  }

  //  Méthode pour basculer la visibilité du mot de passe
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
