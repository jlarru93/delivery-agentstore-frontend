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
        this.audio = new Howl({
            src: ['assets/audio/audio.mp3'],
            loop: true
        });
        this.audioEnabled = this.retrieveAudioEnabledStateFromLocalStorage();
    }
    stopAudio(){
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
    }
    onPlayAudio() {

        if (!this.isPlaying && this.audioEnabled !== null) {
            this.loopAudio = this.audioEnabled;
            this.audio.loop = this.audioEnabled;
            if(this.audioAlreadyPlayed || this.audioEnabled) {

                var isPlaying = this.audio.currentTime > 0 && !this.audio.paused && !this.audio.ended 
                && this.audio.readyState > this.audio.HAVE_CURRENT_DATA;
                if(!isPlaying){
                    this.audio.play();
                }
                this.isPlaying = true;
    
                this.storeAudioEnabledStateInLocalStorage();
            }
        }
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