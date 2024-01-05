import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AsyncData } from "../data/response";
import { OrderResponse } from "../../main/service/data/response";

@Injectable({
    providedIn: 'root'
})
export class StoreHandler{

    public _data: BehaviorSubject<AsyncData<OrderResponse>> = new BehaviorSubject<AsyncData<OrderResponse>>(null);
    data$ = this._data.asObservable();
    audio=new Audio('assets/audio/audio.mp3');
    isPlaying = false;
    loopAudio = true;
    audioEnabled: boolean;

    constructor() {
        this.audio.loop = true;
        this.audio.load();
        this.audioEnabled = this.retrieveAudioEnabledStateFromLocalStorage();
    }

    handle(payload: string) {
        this.onPlayAudio();
        console.log("StoreHandler",payload)
        let response=JSON.parse(payload) as AsyncData<OrderResponse>
        this._data.next(response)
    }

    private onPlayAudio() {

        if (!this.isPlaying && this.audioEnabled !== null) {
            this.loopAudio = this.audioEnabled;
            this.audio.loop = this.audioEnabled;
      
            this.audio.play();
            this.isPlaying = true;

            this.storeAudioEnabledStateInLocalStorage();
        }
    }

    stopAudio(){
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
    }

    retrieveAudioEnabledStateFromLocalStorage(): boolean {
        const storedValue = localStorage.getItem('audioEnabled');
        return storedValue ? JSON.parse(storedValue) : null;
    }
    storeAudioEnabledStateInLocalStorage() {
        localStorage.setItem('audioEnabled', JSON.stringify(this.audioEnabled));
    }
}