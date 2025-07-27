import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderCourseRoutingModule } from './order-course-routing.module';

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
import { OrderCourseComponent } from './order-course.component';
import { environment } from "src/environments/environment";
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [OrderCourseComponent],
  imports: [
    CommonModule,
    OrderCourseRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: environment.GOOGLE.APIKEY,
      libraries: ['drawing']
    }),
    AccordionModule,
    ButtonModule,
    FormsModule,
    AvatarModule,
    InformacionMapaModule,
    DialogModule,
    InputTextModule,
    SelectButtonModule,
    TagModule,
    ChatModule,
    DropdownModule
  ],
  exports : [OrderCourseComponent]
})
export class OrderCourseModule { }
