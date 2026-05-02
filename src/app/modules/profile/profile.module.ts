import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    ButtonModule,
    CardModule,
    CommonModule,
    DialogModule,
    DividerModule,
    FormsModule,
    ProfileRoutingModule,
    ToastModule
  ],
  providers: []
})
export class ProfileModule { }
