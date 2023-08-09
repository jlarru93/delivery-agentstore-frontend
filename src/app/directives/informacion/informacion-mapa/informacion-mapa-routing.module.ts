import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InformacionMapaComponent } from './informacion-mapa.component';


const routes: Routes = [
  {path: '', component: InformacionMapaComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InformacionMapaRoutingModule { }
