import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DynamicReportComponent } from './dynamic-report.component';

const routes: Routes = [
  {
    path: "",
    component: DynamicReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DynamicReportRoutingModule { }
