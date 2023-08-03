import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestTripRoutingModule } from './request-trip-routing.module';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AgmCoreModule } from 'src/agm/core';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { RequestTripComponent } from './request-trip.component';
import { ToolbarModule } from 'primeng/toolbar';
import { InformacionMapaModule } from 'src/app/directives/informacion/informacion-mapa/informacion-mapa.module';

@NgModule({
  declarations: [RequestTripComponent],
  imports: [
    CommonModule,
    RequestTripRoutingModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    InputTextareaModule,
    SelectButtonModule,
    ToolbarModule,
    MatButtonModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule,
    InformacionMapaModule
  ]
})
export class RequestTripModule { }
