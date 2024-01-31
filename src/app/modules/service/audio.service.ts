import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class AudioService{
    audio=new Audio('assets/audio/audio.mp3');
    isPlaying = false;
    loopAudio = true;
    audioEnabled: boolean;
    constructor(){
        this.audio.loop = true;
        this.audio.load();
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
            var isPlaying = this.audio.currentTime > 0 && !this.audio.paused && !this.audio.ended 
            && this.audio.readyState > this.audio.HAVE_CURRENT_DATA;
            if(!isPlaying){
                this.audio.play();
            }
            this.isPlaying = true;

            this.storeAudioEnabledStateInLocalStorage();
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