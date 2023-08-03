import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderCourseComponent } from './order-course.component';

const routes: Routes = [
  {
    path: "",
    component: OrderCourseComponent,
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderCourseRoutingModule { }
