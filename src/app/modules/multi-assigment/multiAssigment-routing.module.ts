import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MultiAssigmentComponent } from './multiAssigment.component';

const routes: Routes = [
  {
    path: "",
    component: MultiAssigmentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MultiAssigmentRoutingModule { }
