import { OrderService } from "./service/order.service";
import {AgmCoreModule} from '../../../agm/core';
import { CommonModule } from "@angular/common";
import { MainComponent } from "./main.component";
import { NgModule } from "@angular/core";
import { MainRoutingModule } from "./main-routing.module";
import { CardModule } from "primeng/card";
import { CircleProgress } from "src/app/utils/circle/circleprogress.component";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { OrderDialogComponent } from "./dialog/orderDialog.component";
import { AccordionModule } from "primeng/accordion";
import { TreeTableModule } from "primeng/treetable";
@NgModule({
    declarations: [MainComponent,CircleProgress,OrderDialogComponent],
    imports: [
      CommonModule,
      MainRoutingModule,
      DialogModule,
      ButtonModule,
      AccordionModule,
      TableModule,
      TreeTableModule,
      AgmCoreModule.forRoot({
        apiKey: "AIzaSyDl_VavzdtyqvdrsOy3Mnsg9hFusgMZ_SY",
        libraries: ['drawing']
      }),
      CardModule,
      DynamicDialogModule
    ],
    providers:[OrderService]
  })
export class MainModule { }
