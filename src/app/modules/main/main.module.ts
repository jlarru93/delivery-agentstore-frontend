import { MainService } from "./service/order.service";
import {AgmCoreModule} from '../../../agm/core';
import { CommonModule } from "@angular/common";
import { MainComponent } from "./main.component";
import { NgModule } from "@angular/core";
import { MainRoutingModule } from "./main-routing.module";
import { CardModule } from "primeng/card";

@NgModule({
    declarations: [MainComponent],
    imports: [
      CommonModule,
      MainRoutingModule,
      AgmCoreModule.forRoot({
        apiKey: "AIzaSyDl_VavzdtyqvdrsOy3Mnsg9hFusgMZ_SY",
        libraries: ['drawing']
      }),
      CardModule
    ],
    providers:[MainService]
  })
export class MainModule { }
