import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  password: string = '';
  showPassword: boolean = false;
  redirectUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute         // Pour récupérer les query params
  ) {
    this.loginForm = this.fb.group({
      UserID: ['', [Validators.required]],
      motDePasse: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Récupérer le paramètre 'redirect' dans l'URL
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirect');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          const role = response?.user?.role;

          if (this.redirectUrl) {
            // Redirige vers le chemin passé en query param 'redirect'
            this.router.navigateByUrl(`/${this.redirectUrl}`);
            return;
          }

          // Sinon redirection classique selon rôle
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
          // Ajouter gestion erreur utilisateur ici si besoin
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  
}

