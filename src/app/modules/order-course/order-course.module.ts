import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderCourseRoutingModule } from './order-course-routing.module';

// modulos prime 
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ChatModule } from 'src/app/chat/chat.module';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { OrderCourseComponent } from './order-course.component';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { SidebarModule } from 'primeng/sidebar';

@NgModule({
  declarations: [OrderCourseComponent],
  imports: [
    CommonModule,
    OrderCourseRoutingModule,
    AccordionModule,
    ButtonModule,
    FormsModule,
    AvatarModule,
    DialogModule,
    InputTextModule,
    SelectButtonModule,
    TagModule,
    ChatModule,
    SidebarModule,
    DropdownModule
  ],
  exports : [OrderCourseComponent]
})
export class OrderCourseModule { }