import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService } from "primeng/dynamicdialog";

@Component({
    selector: 'app-stores',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.scss'],
    providers: [ConfirmationService, MessageService,DialogService]
})
export class ProductComponent implements OnInit {
    ngOnInit(): void {
    }

}