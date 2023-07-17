import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
@Component({
    selector: 'circle-progress',
    templateUrl: './circleprogress.component.html',
    styleUrls: ['./circleprogress.component.scss'],
})
export class CircleProgress implements OnInit {
    @Input() minutes: number;
    @ViewChild('progressValue', { static: true }) progressValue: ElementRef;
    @ViewChild('circularProgress', { static: true }) circularProgress: ElementRef;
    secondsDone:number=0
    secondsElapsed:number=0
    minutesElapsed:number=0
    ngOnInit(): void {
        this.secondsDone=this.minutes*60
        this.start()
    }

    start() {
        let progressStartValue = 0,
            progressEndValue = 100,
            speed = 1000;
        let progress = setInterval(() => {
            this.secondsElapsed++
            progressStartValue=(this.secondsElapsed/this.secondsDone)*progressEndValue
            this.minutesElapsed=Math.floor(this.secondsElapsed/60)
            this.progressValue.nativeElement.textContent = `${this.minutesElapsed} min`
            this.circularProgress.nativeElement.style.background = `conic-gradient(#d94545 ${progressStartValue * 3.6}deg, #ededed 0deg)`

            if (progressStartValue >=progressEndValue) {
                clearInterval(progress);
            }
        }, speed);
    }
}