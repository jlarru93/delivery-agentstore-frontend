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
@NgModule({
    declarations: [ProductComponent],
    imports: [
      CommonModule,
      ProductRoutingModule,
      DialogModule,
      ButtonModule,
      TableModule,
      CardModule,
      DynamicDialogModule
    ],
    providers:[ProductService]
  })
export class ProductModule { }
