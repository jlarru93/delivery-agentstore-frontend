import { Component } from '@angular/core';
import { AppUpdateService } from '../service/app-update.service';

@Component({
  selector: 'app-update-modal',
  templateUrl: './app-update-modal.component.html',
  styleUrls: ['./app-update-modal.component.scss']
})
export class AppUpdateModalComponent {
  constructor(public updateService: AppUpdateService) {}
}