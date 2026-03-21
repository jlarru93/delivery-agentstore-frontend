import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class ConnectionService {
    private isConnected = new BehaviorSubject<boolean>(null);
    public isConnected$ = this.isConnected.asObservable()

    counter: number = 0
    lastUpdateAt: Date = null
    setValue(value: boolean) {
        if (!value) {
            this.counter++
        } else {
            this.isConnected.next(true)
            this.counter = 0
        }
        if (this.counter > 2) {
            const now = new Date()
            
            const five_minutes_ms = 5 * 60 * 1000;
            if (this.lastUpdateAt===null || (now.getTime() - this.lastUpdateAt?.getTime()) >five_minutes_ms) {
                this.lastUpdateAt = new Date()
                this.isConnected.next(false)
                this.counter = 0
            }

        }

    }
}