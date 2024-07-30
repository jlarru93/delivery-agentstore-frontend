import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DynamicReportRoutingModule } from './dynamic-report-routing.module';
import { DynamicReportComponent } from './dynamic-report.component';


@NgModule({
  declarations: [DynamicReportComponent],
  imports: [
    CommonModule,
    DynamicReportRoutingModule
  ]
})
export class DynamicReportModule { }
