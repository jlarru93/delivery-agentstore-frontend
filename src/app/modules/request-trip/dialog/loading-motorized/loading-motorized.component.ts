import { Component, OnInit, OnDestroy } from "@angular/core";
import { RequestTripService } from "../../services/request-trip.service";
import { Router } from "@angular/router";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: "app-loading-motorized",
  templateUrl: "./loading-motorized.component.html",
  styleUrls: ["./loading-motorized.component.scss"],
})
export class LoadingMotorizedComponent implements OnInit, OnDestroy {
  constructor(
    private requestTripService: RequestTripService,
    private router: Router,
    public config: DynamicDialogConfig,
    public ref_dialog: DynamicDialogRef
  ) {}
  status_order?: number = 0;
  interval_motorized_order?: any;
  ngOnInit(): void {
    this.config.data.isUpdated 
  }
  ngOnDestroy() {
    clearInterval(this.interval_motorized_order);
  }
  onClose() {
    this.ref_dialog.close();
  }
  verServicios() {
    this.ref_dialog.close();
    this.router.navigate(["/order-course"]);
    
  }
}
