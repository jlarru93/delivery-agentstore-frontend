import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestTripRoutingModule } from './request-trip-routing.module';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { LoadingMotorizedComponent } from './dialog/loading-motorized/loading-motorized.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { CheckboxModule } from 'primeng/checkbox';
import { TabViewModule } from 'primeng/tabview';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { CalendarModule } from 'primeng/calendar';
import { environment } from "src/environments/environment";
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
  declarations: [RequestTripComponent, LoadingMotorizedComponent],
  imports: [
    AutoCompleteModule,
    AgmCoreModule.forRoot({
      // please get your own API key here:
      // https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en
      apiKey: environment.GOOGLE.APIKEY,
      libraries: ['drawing']
    }),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CheckboxModule,
    RequestTripRoutingModule,
    InputTextModule,
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
    ButtonModule,
    TabViewModule,
    DropdownModule ,
    BsDatepickerModule.forRoot(),
    TypeaheadModule.forRoot(),
    CalendarModule
  ]
})
export class RequestTripModule { }
