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
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AboutComponent } from './features/about/about.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { AdminModule } from './features/admin/admin.module';



// Enregistrement de la locale française
registerLocaleData(localeFr);


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,        // Nécessaire pour HttpClient
    FormsModule,
    ReactiveFormsModule,     // Utile pour les formulaires dans Auth
    SharedModule,
    RouterModule,
    PatientModule,
    BrowserAnimationsModule,
    // CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    RouterModule.forRoot([]),

  ],
  providers: [
     { provide: LOCALE_ID, useValue: 'fr' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
