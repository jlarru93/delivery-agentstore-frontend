import { Component, OnInit, OnDestroy } from "@angular/core";
import { RequestTripService } from "../../services/request-trip.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-loading-motorized",
  templateUrl: "./loading-motorized.component.html",
  styleUrls: ["./loading-motorized.component.scss"],
})
export class LoadingMotorizedComponent implements OnInit, OnDestroy {
  constructor(
    private requestTripService: RequestTripService,
    private router: Router
  ) {}
  status_order?: number = 0;
  interval_motorized_order?: any;
  ngOnInit(): void {
    // this.onSearchMotorizedOrder()
    // this.interval_motorized_order  = setInterval(()=>{
    //   this.onSearchMotorizedOrder()
    // },1000)
  }
  ngOnDestroy() {
    clearInterval(this.interval_motorized_order);
  }
  onClose() {}
  onSearchMotorizedOrder() {
    // this.requestTripService.onLoadingMotorizedService().subscribe(data=>{
    // })
  }
  verServicios() {
    this.router.navigate(["/request-trip"]);
  }
}
