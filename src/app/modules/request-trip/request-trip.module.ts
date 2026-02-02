import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RequestTripRoutingModule } from './request-trip-routing.module';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { RequestTripComponent } from './request-trip.component';
import { ToolbarModule } from 'primeng/toolbar';
import { LoadingMotorizedComponent } from './dialog/loading-motorized/loading-motorized.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { CheckboxModule } from 'primeng/checkbox';
import { TabViewModule } from 'primeng/tabview';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { MultiSelectModule } from 'primeng/multiselect';

@NgModule({
  declarations: [RequestTripComponent, LoadingMotorizedComponent],
  imports: [
    AvatarModule,
    AutoCompleteModule,
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
    InputNumberModule,
    ProgressBarModule,
    ButtonModule,
    TabViewModule,
    DropdownModule,
    MultiSelectModule,
    BsDatepickerModule.forRoot(),
    TypeaheadModule.forRoot(),
    CalendarModule
  ]
})
export class RequestTripModule { }