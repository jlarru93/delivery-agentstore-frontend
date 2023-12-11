import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AlertServices } from 'src/app/modules/service/alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class AlertComponent implements OnInit {

  constructor(
    private message: MessageService,
    private alert: AlertServices,
  ) {
    alert.message.subscribe((data: any) => {
      if (data) {
        this.ShowMessage(data)
      }
    })
  }

  ngOnInit() {
  }
  ShowMessage(Message: any) {
    this.message.clear()
    this.message.add(Message);
  }
}
