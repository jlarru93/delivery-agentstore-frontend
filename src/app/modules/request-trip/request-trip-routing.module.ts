import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestTripComponent } from './request-trip.component';

const routes: Routes = [
  {
    path: "",
    component: RequestTripComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestTripRoutingModule { }
