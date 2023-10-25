import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestTripRoutingModule } from './request-trip-routing.module';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AgmCoreModule } from 'src/agm/core';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatIconModule } from "@angular/material/icon";
import { RequestTripComponent } from './request-trip.component';
import { ToolbarModule } from 'primeng/toolbar';
import { InformacionMapaModule } from 'src/app/directives/informacion/informacion-mapa/informacion-mapa.module';
import { LoadingMotorizedComponent } from './dialog/loading-motorized/loading-motorized.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { CheckboxModule } from 'primeng/checkbox';

@NgModule({
  declarations: [RequestTripComponent, LoadingMotorizedComponent],
  imports: [
    AgmCoreModule.forRoot({
      // please get your own API key here:
      // https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en
      apiKey: 'AIzaSyDl_Vavzdty qvdrsOy3Mnsg9hFusgMZ_SY',
    }),
    CommonModule,
    CheckboxModule,
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
    InformacionMapaModule,
    InputNumberModule,
    ProgressBarModule,
    ButtonModule
  ]
})
export class RequestTripModule { }
