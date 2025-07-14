import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HomeComponent } from './features/home/home.component';
import { AboutComponent } from './features/about/about.component'; // <-- import ajouté

import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PatientModule } from './features/patient/patient.module';

import { CalendarModule, DateAdapter } from 'angular-calendar'; // <-- import ajouté
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns'; // <-- import ajouté

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

// Enregistrement de la locale française
registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent // Composant accueil déclaré ici
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    BrowserAnimationsModule,
    PatientModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }), // calendrier
  ],
  providers: [
     { provide: LOCALE_ID, useValue: 'fr' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
