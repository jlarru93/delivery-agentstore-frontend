import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestOrderRoutingModule } from './request-order-routing.module';
import { RequestOrderComponent } from './request-order.component';




@NgModule({
  declarations: [RequestOrderComponent],
  imports: [
    CommonModule,
    RequestOrderRoutingModule
  ]
})
export class RequestOrderModule { }
