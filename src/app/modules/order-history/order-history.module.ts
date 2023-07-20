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
import { ChatComponent } from 'src/app/chat/chat.component';


@NgModule({
  declarations: [OrderHistoryComponent],
  imports: [
    ButtonModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    ToolbarModule,
    ToastModule,
    TableModule,
    OrderHistoryRoutingModule
  ]
})
export class OrderHistoryModule { }
