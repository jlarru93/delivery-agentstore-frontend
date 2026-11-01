import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SidebarModule } from 'primeng/sidebar';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { SupportComponent } from './support.component';

// Casos del local con la Mesa de ayuda de Piwi (WBS 1.4, Etapa 4). SupportService y CaseWatchService son de la raíz:
// el tablero de pedidos y el topbar también los usan.
@NgModule({
    declarations: [SupportComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild([{ path: '', component: SupportComponent }]),
        ButtonModule,
        DropdownModule,
        InputNumberModule,
        InputTextModule,
        InputTextareaModule,
        SidebarModule,
        TabViewModule,
        ToastModule,
        TooltipModule,
    ],
})
export class SupportModule { }
