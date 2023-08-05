import { Component, OnInit } from '@angular/core';
import { RequestTripService } from '../../services/request-trip.service';

@Component({
  selector: 'app-loading-motorized',
  templateUrl: './loading-motorized.component.html',
  styleUrls: ['./loading-motorized.component.scss']
})
export class LoadingMotorizedComponent implements OnInit {

  constructor(    private requestTripService: RequestTripService,
    ) { }
  status_order ?: number = 0
  ngOnInit(): void {
  }
  onClose(){

  }
  onSearchMotorizedOrder(){
    // this.requestTripService.onLoadingMotorizedService()
  }

}
