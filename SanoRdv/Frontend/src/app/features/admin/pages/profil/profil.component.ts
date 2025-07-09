import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Admin } from '../../models/admin.model';


@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent {

       profileForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      photo: [null]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.profileForm.patchValue({ photo: file });
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const formData = new FormData();
      formData.append('nom', this.profileForm.get('nom')?.value);
      formData.append('prenom', this.profileForm.get('prenom')?.value);
      if (this.selectedFile) {
        formData.append('photo', this.selectedFile);
      }

      // 🔁 Ici, envoie au backend via un service HTTP
      console.log('Formulaire prêt à être envoyé :', formData);
    }
  }

}
