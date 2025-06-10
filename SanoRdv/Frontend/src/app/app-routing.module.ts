import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

const routes: Routes = [
  {path:'',component:MainLayoutComponent}




//   {path:'facebook',component:MainLayoutComponent,children:[

//          {path:'about',component:AboutComponent},
//          {path:'service',component:ServiceComponent},
//          {path:'contact',component:ContactComponent}

// ]}


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
