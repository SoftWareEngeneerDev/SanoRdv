import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './features/home/home.component';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PatientModule } from './features/patient/patient.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent // Composant accueil déclaré ici
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,        // Nécessaire pour HttpClient
    FormsModule,
    ReactiveFormsModule,     // Utile pour les formulaires dans Auth
    SharedModule,
    BrowserAnimationsModule,
    PatientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }