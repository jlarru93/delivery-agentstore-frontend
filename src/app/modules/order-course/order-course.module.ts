import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderCourseRoutingModule } from './order-course-routing.module';
import { OrderCourseComponent } from './order-course.component';

// modulos prime 
import { AccordionModule } from 'primeng/accordion';
import { AgmCoreModule } from 'src/agm/core';

@NgModule({
  declarations: [OrderCourseComponent],
  imports: [
    CommonModule,
    OrderCourseRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyDl_VavzdtyqvdrsOy3Mnsg9hFusgMZ_SY",
      libraries: ['drawing']
    }),
    AccordionModule
  ],
  exports : [OrderCourseComponent]
})
export class OrderCourseModule { }
