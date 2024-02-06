import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalRoutingModule } from './modal-routing.module';
import { ModalComponent } from './modal.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [ModalComponent],
  imports: [
    CommonModule,
    ModalRoutingModule,
    MatDialogModule,
    ButtonModule,
    MatButtonModule
  ],
  exports: [ModalComponent]
})
export class ModalModule { }
