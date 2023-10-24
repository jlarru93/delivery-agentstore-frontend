import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrintTemplateRoutingModule } from './print-template-routing.module';
import { PrintTemplateComponent } from './print-template.component';


@NgModule({
  declarations: [PrintTemplateComponent],
  imports: [
    CommonModule,
    PrintTemplateRoutingModule
  ],
  exports: [PrintTemplateComponent]
})
export class PrintTemplateModule { }
