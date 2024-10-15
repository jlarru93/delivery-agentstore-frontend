import { NgModule } from "@angular/core";
import { DialogUpdateWebComponent } from "./dialogUpdateWeb.component";
import {DialogModule} from 'primeng/dialog';
import { ButtonModule } from "primeng/button";
import { BrowserModule } from "@angular/platform-browser";

@NgModule({
  declarations: [],
  imports: [
    DialogModule,
    ButtonModule
  ]
})
export class DialogUpdateWebModule { }
