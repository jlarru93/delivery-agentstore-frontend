import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserReportRoutingModule } from './user-report-routing.module';
import { UserReportComponent } from './user-report.component';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';


@NgModule({
  declarations: [UserReportComponent],
  imports: [
    ButtonModule,
    CommonModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    PaginatorModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    UserReportRoutingModule
  ],
  providers: []
})
export class UserReportModule { }
