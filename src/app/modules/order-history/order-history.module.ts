import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderHistoryRoutingModule } from './order-history-routing.module';
import { OrderHistoryComponent } from './order-history.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ImageModule} from 'primeng/image';
import {SplitButtonModule} from 'primeng/splitbutton';
import { ChatModule } from 'src/app/chat/chat.module';
import {GalleriaModule} from 'primeng/galleria';
import { PaginatorModule } from 'primeng/paginator';
import { CarouselModule } from 'primeng/carousel';


@NgModule({
  declarations: [OrderHistoryComponent],
  imports: [
    AvatarModule,
    AvatarGroupModule,
    ButtonModule,
    CarouselModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    GalleriaModule,
    InputTextModule,
    ImageModule,
    ChatModule,
    ToolbarModule,
    ToastModule,
    TableModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    OrderHistoryRoutingModule,
    PaginatorModule,
    SplitButtonModule
  ]
})
export class OrderHistoryModule { }
