import { Component, OnInit } from "@angular/core";
import { ConfirmationService, MessageService } from 'primeng/api';
@Component({
    selector: 'app-stores',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    providers: [ConfirmationService, MessageService]
  })
  export class MainComponent implements OnInit {
    minutes: number = 2;
    displayOrder:boolean=true
    ngOnInit(): void {
    }
  
}