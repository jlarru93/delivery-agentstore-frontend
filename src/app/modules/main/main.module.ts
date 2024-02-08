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
import { OverlayPanelModule } from "primeng/overlaypanel";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDividerModule } from "@angular/material/divider";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { AvatarModule } from "primeng/avatar";
import { AvatarGroupModule } from "primeng/avatargroup";
import { ChatComponent } from "src/app/chat/chat.component";
import { InputTextModule } from "primeng/inputtext";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ModalModule } from "src/app/modal/modal.module";
import { ChatModule } from "src/app/chat/chat.module";
import { ToastModule } from "primeng/toast";
import { PrintTemplateModule } from "src/app/print-template/print-template.module";
import { TagModule } from "primeng/tag";
import { InputSwitchModule } from 'primeng/inputswitch';
import { ChipModule } from "primeng/chip";
import { ProgressSpinnerModule } from "primeng/progressspinner";

@NgModule({
    declarations: [MainComponent,CircleProgress,OrderDialogComponent],
    imports: [
      AvatarModule,
      AvatarGroupModule,
      ModalModule,
      CommonModule,
      ConfirmDialogModule,
      FormsModule,
      ReactiveFormsModule,
      MainRoutingModule,
      ChatModule,
      ChipModule,
      PrintTemplateModule,
      DialogModule,
      ButtonModule,
      ToastModule,
      AccordionModule,
      TableModule,
      ProgressSpinnerModule,
      TreeTableModule,
      CardModule,
      DynamicDialogModule,
      OverlayPanelModule,
      MatDividerModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatIconModule,
      InputTextModule,
      TagModule,
      InputSwitchModule
    ],
    providers:[OrderService]
  })
export class MainModule { }
