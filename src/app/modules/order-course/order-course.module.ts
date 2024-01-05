import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderCourseRoutingModule } from './order-course-routing.module';
import { OrderCourseComponent } from './order-course.component';

// modulos prime 
import { AccordionModule } from 'primeng/accordion';
import { AgmCoreModule } from 'src/agm/core';
import { InformacionMapaModule } from 'src/app/directives/informacion/informacion-mapa/informacion-mapa.module';
import { ButtonModule } from 'primeng/button';
import { ChatModule } from 'src/app/chat/chat.module';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [OrderCourseComponent],
  imports: [
    CommonModule,
    OrderCourseRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyDl_VavzdtyqvdrsOy3Mnsg9hFusgMZ_SY",
      libraries: ['drawing']
    }),
    AccordionModule,
    ButtonModule,
    FormsModule,
    AvatarModule,
    InformacionMapaModule,
    SelectButtonModule,
    TagModule,
    ChatModule
  ],
  exports : [OrderCourseComponent]
})
export class OrderCourseModule { }
