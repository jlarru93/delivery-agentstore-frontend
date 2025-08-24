// audio.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioBackgroundService {
    private audio?: HTMLAudioElement;

    private ensureAudio() {
        if (!this.audio) {
            this.audio = new Audio();
            this.audio.preload = 'auto';
            this.audio.loop = false; // cámbialo si quieres
            this.wireMediaSession();
        }
        return this.audio!;
    }

    async play(url: string, metadata?: any) {
        const el = this.ensureAudio();

        // Si cambia la pista, reasigna src
        if (el.src !== new URL(url, window.location.origin).toString()) {
            el.src = url;
        }
        this.setMetadata(metadata);
        try {
            await el.play(); // requiere al menos 1 gesto previo del usuario en la sesión
        } catch (e) {
            console.warn('No se pudo reproducir (gesture requerida / política del navegador):', e);
        }
    }

    pause() {
        this.audio?.pause();
    }

    private setMetadata(md?: any) {
        if (!('mediaSession' in navigator) || !md) return;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: md.title || 'Audio',
            artist: md.artist || 'Piwi',
            album: md.album || '',
            artwork: md.artwork || []
        });
    }

    private wireMediaSession() {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.setActionHandler('play', () => this.audio?.play());
        navigator.mediaSession.setActionHandler('pause', () => this.audio?.pause());
        navigator.mediaSession.setActionHandler('stop', () => { if (this.audio) { this.audio.pause(); this.audio.currentTime = 0; } });
        // Opcionales: seekbackward/seekforward/nexttrack/previoustrack
    }
}
