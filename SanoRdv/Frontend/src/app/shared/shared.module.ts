import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { SharedLayoutComponent } from './components/shared-layout/shared-layout.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SharedLayoutComponent  // ✅ obligatoire si utilisé
  ],
  imports: [
    CommonModule,
    RouterModule           // ✅ nécessaire pour <router-outlet>
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SharedLayoutComponent  // ✅ pour l’utiliser ailleurs
  ]
})
export class SharedModule { }
