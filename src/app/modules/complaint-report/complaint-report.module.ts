import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComplaintReportRoutingModule } from './complaint-report-routing.module';
import { ComplaintReportComponent } from './complaint-report.component';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GalleriaModule } from 'primeng/galleria';
import { InputTextModule } from 'primeng/inputtext';
import { ImageModule } from 'primeng/image';
import { ChatModule } from 'src/app/chat/chat.module';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { PaginatorModule } from 'primeng/paginator';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CarouselModule } from 'primeng/carousel';


@NgModule({
  declarations: [ComplaintReportComponent],
  imports: [
    AvatarModule,
    AvatarGroupModule,
    ButtonModule,
    CarouselModule,
    CommonModule,
    ComplaintReportRoutingModule,
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
    PaginatorModule,
    SplitButtonModule
  ]
})
export class ComplaintReportModule { }
