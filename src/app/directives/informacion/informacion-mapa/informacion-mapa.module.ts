import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InformacionMapaRoutingModule } from './informacion-mapa-routing.module';
import { InformacionMapaComponent } from './informacion-mapa.component';



@NgModule({
  declarations: [InformacionMapaComponent],
  imports: [
    CommonModule,
    InformacionMapaRoutingModule,
  ],
  exports:[InformacionMapaComponent]
})
export class InformacionMapaModule { }
