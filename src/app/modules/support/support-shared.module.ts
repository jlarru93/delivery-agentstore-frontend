import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { CaseThreadComponent } from './case-thread/case-thread.component';
import { OrderCasesComponent } from './order-cases/order-cases.component';

// Detalle de una incidencia (en "Casos" y en el modal de la orden) y las incidencias de un pedido (modal de la orden).
@NgModule({
    declarations: [CaseThreadComponent, OrderCasesComponent],
    imports: [CommonModule, FormsModule, ButtonModule, DropdownModule, InputTextModule, InputTextareaModule, ToastModule, TooltipModule],
    exports: [CaseThreadComponent, OrderCasesComponent],
})
export class SupportSharedModule { }
