import { AfterViewInit, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
@Component({
    selector: 'circle-progress',
    templateUrl: './circleprogress.component.html',
    styleUrls: ['./circleprogress.component.scss'],
})
export class CircleProgress implements OnInit, AfterViewInit {
    @Input() minutes: number;
    @ViewChild('progressValue', { static: true }) progressValue: ElementRef;
    @ViewChild('circularProgress', { static: true }) circularProgress: ElementRef;
    
    totalTimeInSeconds: number;
    secondsElapsed: number = 0;
    minutesElapsed: number = 0;

    @Input() endTime: number;
    @Input() startTime: number;

    ngOnInit(): void {
        // this.secondsDone=this.minutes*60
        // this.start()
    }

    ngAfterViewInit(): void {
      this.totalTimeInSeconds = (this.endTime - this.startTime);
      this.start();
    }

    start() {
        const progressEndValue = 100;
        const speed = 1000;
    
        const progress = setInterval(() => {
            const now=Number(new Date().getTime().toString().substring(0,10))

            this.secondsElapsed=(this.endTime-now)
            const progressPercentage = (this.secondsElapsed / this.totalTimeInSeconds) * progressEndValue;
            this.minutesElapsed = Math.floor(this.secondsElapsed / 60);
            this.progressValue.nativeElement.textContent = `${this.minutesElapsed} min`;
            this.circularProgress.nativeElement.style.background = `conic-gradient(#d94545 ${progressPercentage * 3.6}deg, #ededed 0deg)`;
      
            if (progressPercentage >= progressEndValue || this.secondsElapsed >= this.totalTimeInSeconds) {
              clearInterval(progress);
            }
          }, speed);    
      }
}