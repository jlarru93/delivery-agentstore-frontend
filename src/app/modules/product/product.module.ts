import {AgmCoreModule} from '../../../agm/core';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ProductComponent } from "./product.component";
import { ProductRoutingModule } from "./product-routing.module";
import { ProductService } from './service/product.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { TreeModule } from 'primeng/tree';
import { ToastModule } from 'primeng/toast';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';


@NgModule({
    declarations: [ProductComponent],
    imports: [
      CommonModule,
      ProductRoutingModule,
      FormsModule,
      DialogModule,
      ButtonModule,
      TableModule,
      CardModule,
      DynamicDialogModule,
      ProgressBarModule,
      TreeModule,
      ToastModule,
      SelectButtonModule
    ],
    providers:[ProductService]
  })
export class ProductModule { }
