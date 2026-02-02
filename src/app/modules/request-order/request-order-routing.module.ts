import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestOrderComponent } from './request-order.component';

const routes: Routes = [
  {
    path: "",
    component: RequestOrderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestOrderRoutingModule { }
