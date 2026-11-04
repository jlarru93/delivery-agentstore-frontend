import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { CaseThreadComponent } from './case-thread/case-thread.component';

// Detalle de una incidencia, usado en "Casos" y en el modal de la orden (main).
@NgModule({
    declarations: [CaseThreadComponent],
    imports: [CommonModule, FormsModule, ButtonModule, InputTextareaModule, ToastModule, TooltipModule],
    exports: [CaseThreadComponent],
})
export class SupportSharedModule { }
