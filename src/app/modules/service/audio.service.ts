import { Injectable } from "@angular/core";
import { Howl } from "howler";

@Injectable({
    providedIn: "root"
})
export class AudioService{
    audio: Howl
    isPlaying = false;
    loopAudio = true;
    audioEnabled: boolean;
    audioAlreadyPlayed: boolean = false
    constructor(){
        this.audio = new Audio('assets/audio/audio.mp3');
        this.audioEnabled = this.retrieveAudioEnabledStateFromLocalStorage();
    }
    stopAudio(){
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
    }
    onPlayAudio() {

        if (!this.isPlaying) {
            
            if(this.audioEnabled === true){
                this.audio.loop = true;
                this.audio.load()
                if(this.audioAlreadyPlayed) {

                    var isPlaying = this.audio.currentTime > 0 && !this.audio.paused && !this.audio.ended 
                    && this.audio.readyState > this.audio.HAVE_CURRENT_DATA;
                    if(!isPlaying){
                        this.audio.play();
                    }
                    this.isPlaying = true;
                }
            } else if (this.audioEnabled === false) {
                this.audio.loop = false;
                this.audio.load()
                if(this.audioAlreadyPlayed) {

                    var isPlaying = this.audio.currentTime > 0 && !this.audio.paused && !this.audio.ended 
                    && this.audio.readyState > this.audio.HAVE_CURRENT_DATA;
                    if(!isPlaying){
                        this.audio.play();
                    }
                    //this.isPlaying = true;
                }
            } else {
                this.isPlaying = false;
            }
        }
    }

    onPlayAudioFirstLoad(){
        this.audio.play();
    }

    storeAudioEnabledStateInLocalStorage() {
        console.log(this.audioEnabled)
        localStorage.setItem('audioEnabled', JSON.stringify(this.audioEnabled));
        if(!this.audioEnabled){
            this.stopAudio()
        }
    }
    retrieveAudioEnabledStateFromLocalStorage(): boolean {
        const storedValue = localStorage.getItem('audioEnabled');
        return storedValue ? JSON.parse(storedValue) : null;
    }
}