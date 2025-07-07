import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { PatientComponent } from './models/patient/patient.component';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    PatientComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SharedModule { }
