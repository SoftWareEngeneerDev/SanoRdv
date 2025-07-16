import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Pipes
import { ReplaceVariablesPipe } from './../shared/pipes/replace-variables.pipe';
import { DateStringToDatePipe } from './../shared/pipes/date-string-to-date.pipe';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SharedLayoutComponent } from './components/shared-layout/shared-layout.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SharedLayoutComponent, // obligatoire si utilisé dans le projet
    ReplaceVariablesPipe,
    DateStringToDatePipe
  ],
  imports: [
    CommonModule,
    RouterModule,         // nécessaire pour utiliser <router-outlet> dans SharedLayoutComponent
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SharedLayoutComponent, // pour pouvoir les utiliser dans d'autres modules
    ReplaceVariablesPipe,
    DateStringToDatePipe
  ]
})
export class SharedModule { }
