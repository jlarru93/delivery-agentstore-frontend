
import { NgModule } from '@angular/core';
import { AlertComponent } from './alert.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AlertRoutingModule } from './alert-routing.module';
@NgModule({
    declarations: [
        AlertComponent
    ],
    imports: [
        CommonModule,
        AlertRoutingModule,
        FormsModule,
        ToastModule,
        ConfirmDialogModule
    ],
    exports: [
        AlertComponent,
    ]
})
export class AlertModule { }
