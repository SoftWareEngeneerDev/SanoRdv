import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SharedLayoutComponent } from './shared-layout/shared-layout.component';
import { SharedRoutingModule } from './shared-routing.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SharedLayoutComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    RouterModule
  ],
  exports: [
    SharedLayoutComponent // <-- pour l'utiliser dans app et auth
  ]
})
export class SharedModule { }
