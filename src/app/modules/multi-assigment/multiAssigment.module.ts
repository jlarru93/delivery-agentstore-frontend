import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiAssigmentComponent } from './multiAssigment.component';
import { MultiAssigmentRoutingModule } from './multiAssigment-routing.module';

@NgModule({
  declarations: [MultiAssigmentComponent],
  imports: [
    CommonModule,
    MultiAssigmentRoutingModule
  ]
})
export class MultiAssigmentModule { }
